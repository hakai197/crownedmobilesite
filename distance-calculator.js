document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_KEY = 'Q7ITe5MB0a4STWkyy8GUQ3nvv5leH3TjZAqL0dfJaSeT1U9ap7TA35bw1KqUGrFS';
    const BASE_ZIP = '45177';
    const PROXIES = [
        'https://corsproxy.io/?',  // Currently most reliable
        'https://api.allorigins.win/get?url=', 
        'https://thingproxy.freeboard.io/fetch/',
        'https://yacdn.org/proxy/'
    ];
    const MAX_RETRIES = 2;

    async function fetchWithRetry(url, retries = MAX_RETRIES) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.log(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) throw error;
            }
        }
        throw new Error('Max retries reached');
    }

    async function tryDirectApiCall(zipcode) {
        const url = `https://www.zipcodeapi.com/rest/${API_KEY}/distance.json/${BASE_ZIP}/${zipcode}/mile`;
        return fetchWithRetry(url);
    }

    async function tryProxyApiCall(zipcode) {
        const apiUrl = `https://www.zipcodeapi.com/rest/${API_KEY}/distance.json/${BASE_ZIP}/${zipcode}/mile`;
        
        for (const proxy of PROXIES) {
            try {
                let proxyUrl;
                if (proxy.includes('allorigins')) {
                    proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}&callback=?`;
                } else {
                    proxyUrl = proxy + encodeURIComponent(apiUrl);
                }
                
                const data = await fetchWithRetry(proxyUrl);
                const result = proxy.includes('allorigins') ? JSON.parse(data.contents) : data;
                
                if (result.error_code) {
                    throw new Error(result.error_msg);
                }
                
                return result;
            } catch (error) {
                console.log(`Proxy ${proxy} failed:`, error);
                continue;
            }
        }
        throw new Error('All proxy attempts failed');
    }

    function calculateCost(distance) {
        const excessMiles = Math.max(0, distance - 15);
        return (excessMiles * 0.7).toFixed(2);
    }

    function updateUI(distance, cost) {
        document.getElementById('miles').textContent = distance.toFixed(1);
        document.getElementById('excessMiles').textContent = Math.max(0, distance - 15).toFixed(1);
        document.getElementById('travelFee').textContent = cost;
        document.getElementById('distanceResult').classList.remove('hidden');
        
        document.querySelectorAll('.final-price .total').forEach(el => {
            const priceText = el.closest('li').querySelector('.price').textContent;
            const basePrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
            if (!isNaN(basePrice)) {
                el.textContent = (basePrice + parseFloat(cost)).toFixed(2);
            }
        });
    }

    function initializeDistanceCalculator() {
        const calculateBtn = document.getElementById('calculateBtn');
        
        calculateBtn.addEventListener('click', async function() {
            const zipcode = document.getElementById('zipcode').value.trim();
            
            if (!/^\d{5}$/.test(zipcode)) {
                alert('Please enter a valid 5-digit zip code');
                return;
            }

            try {
                calculateBtn.disabled = true;
                calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
                
                let result;
                try {
                    result = await tryDirectApiCall(zipcode);
                } catch (directError) {
                    console.log('Direct call failed, trying proxies...');
                    result = await tryProxyApiCall(zipcode);
                }
                
                if (!result || result.error_code) {
                    throw new Error(result?.error_msg || 'Failed to calculate distance');
                }
                
                const cost = calculateCost(result.distance);
                updateUI(result.distance, cost);
                
            } catch (error) {
                console.error('Error:', error);
                alert(`Could not calculate distance. ${error.message}. Please try again later or contact support.`);
                
                // Fallback: Allow manual distance entry
                const useManual = confirm("API failed. Would you like to enter distance manually?");
                if (useManual) {
                    const manualDistance = prompt("Enter distance in miles:");
                    if (manualDistance && !isNaN(manualDistance)) {
                        const cost = calculateCost(parseFloat(manualDistance));
                        updateUI(parseFloat(manualDistance), cost);
                    }
                }
            } finally {
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Fee';
            }
        });

        // Appointment button handler remains the same
        const applyToAppointmentBtn = document.getElementById('applyToAppointment');
        if (applyToAppointmentBtn) {
            applyToAppointmentBtn.addEventListener('click', function() {
                const travelFee = document.getElementById('travelFee').textContent;
                localStorage.setItem('travelFee', travelFee);
                window.location.href = 'appointment.html';
            });
        }
    }

    if (document.getElementById('calculateBtn')) {
        initializeDistanceCalculator();
    }
});