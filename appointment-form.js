// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date
    document.getElementById('date').min = new Date().toISOString().split('T')[0];
    
    // Form submission handler
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
            }
            // Let Formspree handle the submission
        });
    }
    
    // Check for and apply travel fee from localStorage
    applyTravelFee();
});

function applyTravelFee() {
    const travelFee = localStorage.getItem('travelFee');
    const distance = localStorage.getItem('distance');
    const serviceZip = document.getElementById('serviceZip');
    const zipcode = localStorage.getItem('zipcode');
    
    if (travelFee && distance && serviceZip && zipcode) {
        document.getElementById('travelFeeField').value = travelFee;
        document.getElementById('distanceField').value = distance;
        serviceZip.value = zipcode;
        
        // Create and display travel fee info
        const feeDisplay = document.getElementById('autoTravelFeeDisplay');
        if (feeDisplay) {
            feeDisplay.innerHTML = `
                <div class="travel-fee-notice">
                    <i class="fas fa-car"></i>
                    <div>
                        <p>Travel fee applied: $${travelFee} (${distance} miles from 45177)</p>
                        <small>This fee will be added to your total</small>
                    </div>
                </div>
            `;
        }
        
        // Clear localStorage values
        localStorage.removeItem('travelFee');
        localStorage.removeItem('distance');
        localStorage.removeItem('zipcode');
    }
}