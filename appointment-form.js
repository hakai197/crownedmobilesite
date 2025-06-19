// Set minimum date to today and handle form submission
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.min = new Date().toISOString().split('T')[0];
    }

    // Form submission handler
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
            }

            // Submit form data
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Redirect to thank you page
                    window.location.href = 'thank-you.html';
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem submitting your form. Please try again.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Schedule Appointment';
                }
            });
        });
    }
});

// Form validation function
function validateForm() {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const serviceZip = document.getElementById('serviceZip').value;

    // Basic validation
    if (!name || name.length < 2) {
        alert('Please enter your full name');
        return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address');
        return false;
    }

    if (!serviceZip || serviceZip.length < 5) {
        alert('Please enter a valid zip code');
        return false;
    }

    if (!service) {
        alert('Please select a service');
        return false;
    }

    if (!date) {
        alert('Please select a date');
        return false;
    }

    if (!time) {
        alert('Please select a time');
        return false;
    }

    return true;
}