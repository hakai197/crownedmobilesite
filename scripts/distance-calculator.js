document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const apiKey = 'saIt3PXAfWQDhW9gxAwshRoNK1DJPeEcRDWFYyoS2OSxwbEK2pSXlTiPLJXpdc3S';
    const baseZip = '45177';

    if (calculateBtn) {
        calculateBtn.addEventListener('click', async function() {
            const zipcode = document.getElementById('zipcode').value.trim();
            
            if (!/^\d{5}$/.test(zipcode)) {
                alert('Please enter a valid 5-digit zip code');
                return;
            }

            try {
                // Show loading state
                calculateBtn.disabled = true;
                calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
                
                console.log('Attempting to calculate distance...'); // Debug log
                
                // First try direct API call
                let result = await tryDirectApiCall(zipcode);
                
                // If direct fails, try with CORS proxy
                if (!result.success) {
                    console.log('Direct API failed, trying with proxy...'); // Debug log
                    result = await tryProxyApiCall(zipcode);
                }
                
                if (!result.success) {
                    throw new Error(result.error || 'Failed to calculate distance');
                }
                
                updateUI(result.data.distance, result.data.cost);
                
            } catch (error) {
                console.error('Full error details:', error); // Debug log
                alert(`Error: ${error.message}`);
            } finally {
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Fee';
            }
        });
    }

    async function tryDirectApiCall(zipcode) {
        try {
            const url = `https://www.zipcodeapi.com/rest/${apiKey}/distance.json/${baseZip}/${zipcode}/mile`;
            console.log('Direct API URL:', url); // Debug log
            
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

    async function tryProxyApiCall(zipcode) {
        try {
            // Try different CORS proxies
            const proxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            
            const apiUrl = `https://www.zipcodeapi.com/rest/${apiKey}/distance.json/${baseZip}/${zipcode}/mile`;
            
            for (const proxy of proxies) {
                try {
                    console.log('Trying proxy:', proxy); // Debug log
                    const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    
                    if (!response.ok) {
                        continue; // Try next proxy
                    }
                    
                    const data = await response.json();
                    
                    if (data.error_code) {
                        continue; // Try next proxy
                    }
                    
                    const distance = data.distance;
                    const cost = distance > 15 ? (distance - 15) * 0.7: 0;
                    
                    return {
                        success: true,
                        data: {
                            distance: distance,
                            cost: cost.toFixed(2)
                        }
                    };
                    
                } catch (e) {
                    console.log(`Proxy ${proxy} failed:`, e); // Debug log
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
            const basePrice = parseFloat(el.parentElement.previousElementSibling.textContent.replace('$', ''));
            const total = basePrice + parseFloat(cost);
            el.textContent = total.toFixed(2);
        });
    }

    // Apply to appointment button handler
    const applyToAppointmentBtn = document.getElementById('applyToAppointment');
    if (applyToAppointmentBtn) {
        applyToAppointmentBtn.addEventListener('click', function() {
            const travelFee = document.getElementById('travelFee').textContent;
            localStorage.setItem('travelFee', travelFee);
            window.location.href = 'appointment.html';
        });
    }
});