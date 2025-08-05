
document.addEventListener('DOMContentLoaded', function() {
    // Function declarations (hoisted)
    async function tryDirectApiCall(zipcode, apiKey, baseZip) {
        try {
            const url = `https://www.zipcodeapi.com/rest/${apiKey}/distance.json/${baseZip}/${zipcode}/mile`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_msg || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            const distance = data.distance;
            const cost = distance > 15 ? (distance - 15) * 0.7 : 0;
            
            return {
                success: true,
                data: {
                    distance: distance,
                    cost: cost.toFixed(2)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async function tryProxyApiCall(zipcode, apiKey, baseZip) {
        try {
            const proxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            
            const apiUrl = `https://www.zipcodeapi.com/rest/${apiKey}/distance.json/${baseZip}/${zipcode}/mile`;
            
            for (const proxy of proxies) {
                try {
                    const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    
                    if (!response.ok) continue;
                    
                    const data = await response.json();
                    if (data.error_code) continue;
                    
                    const distance = data.distance;
                    const cost = distance > 15 ? (distance - 15) * 0.7 : 0;
                    
                    return {
                        success: true,
                        data: {
                            distance: distance,
                            cost: cost.toFixed(2)
                        }
                    };
                } catch (e) {
                    console.log(`Proxy failed:`, e);
                    continue;
                }
            }
            throw new Error('All proxy attempts failed');
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    function updateUI(distance, cost) {
        document.getElementById('miles').textContent = distance.toFixed(1);
        const excessMiles = Math.max(0, distance - 15);
        document.getElementById('excessMiles').textContent = excessMiles.toFixed(1);
        document.getElementById('travelFee').textContent = cost;
        document.getElementById('distanceResult').classList.remove('hidden');
        
        document.querySelectorAll('.final-price .total').forEach(el => {
            const priceText = el.closest('li').querySelector('.price').textContent;
            const basePrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
            if (!isNaN(basePrice)) {
                const total = basePrice + parseFloat(cost);
                el.textContent = total.toFixed(2);
            }
        });
    }

    function initializeDistanceCalculator() {
        const calculateBtn = document.getElementById('calculateBtn');
        const apiKey = Q7ITe5MB0a4STWkyy8GUQ3nvv5leH3TjZAqL0dfJaSeT1U9ap7TA35bw1KqUGrFS';
        const baseZip = '45177';

        calculateBtn.addEventListener('click', async function() {
            const zipcode = document.getElementById('zipcode').value.trim();
            
            if (!/^\d{5}$/.test(zipcode)) {
                alert('Please enter a valid 5-digit zip code');
                return;
            }

            try {
                calculateBtn.disabled = true;
                calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
                
                let result = await tryDirectApiCall(zipcode, apiKey, baseZip);
                if (!result.success) {
                    result = await tryProxyApiCall(zipcode, apiKey, baseZip);
                }
                if (!result.success) {
                    throw new Error(result.error || 'Failed to calculate distance');
                }
                
                updateUI(result.data.distance, result.data.cost);
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Fee';
            }
        });

        const applyToAppointmentBtn = document.getElementById('applyToAppointment');
        if (applyToAppointmentBtn) {
            applyToAppointmentBtn.addEventListener('click', function() {
                const travelFee = document.getElementById('travelFee').textContent;
                localStorage.setItem('travelFee', travelFee);
                window.location.href = 'appointment.html';
            });
        }
    }

    // Initialize if calculator exists on page
    if (document.getElementById('calculateBtn')) {
        initializeDistanceCalculator();
    }
});