document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // Form validation
    function validateField(field, errorId, validationFn) {
        const errorElement = document.getElementById(errorId);
        const isValid = validationFn(field.value);
        
        if (!isValid) {
            field.closest('.form-group').classList.add('error');
            errorElement.style.display = 'block';
            return false;
        } else {
            field.closest('.form-group').classList.remove('error');
            errorElement.style.display = 'none';
            return true;
        }
    }
    
    // Validation functions
    const validations = {
        name: value => value.trim().length > 0,
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: value => !value || /^[\d\s\-()+]{10,}$/.test(value),
        serviceZip: value => /^\d{5}(-\d{4})?$/.test(value),
        service: value => value !== "",
        date: value => value !== "",
        time: value => value !== ""
    };
    
    // Add event listeners for real-time validation
    document.getElementById('name').addEventListener('blur', function() {
        validateField(this, 'name-error', validations.name);
    });
    
    document.getElementById('email').addEventListener('blur', function() {
        validateField(this, 'email-error', validations.email);
    });
    
    document.getElementById('phone').addEventListener('blur', function() {
        validateField(this, 'phone-error', validations.phone);
    });
    
    document.getElementById('serviceZip').addEventListener('blur', function() {
        validateField(this, 'zip-error', validations.serviceZip);
    });
    
    document.getElementById('service').addEventListener('change', function() {
        validateField(this, 'service-error', validations.service);
    });
    
    document.getElementById('date').addEventListener('change', function() {
        validateField(this, 'date-error', validations.date);
    });
    
    document.getElementById('time').addEventListener('change', function() {
        validateField(this, 'time-error', validations.time);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        
        isValid &= validateField(document.getElementById('name'), 'name-error', validations.name);
        isValid &= validateField(document.getElementById('email'), 'email-error', validations.email);
        isValid &= validateField(document.getElementById('serviceZip'), 'zip-error', validations.serviceZip);
        isValid &= validateField(document.getElementById('service'), 'service-error', validations.service);
        isValid &= validateField(document.getElementById('date'), 'date-error', validations.date);
        isValid &= validateField(document.getElementById('time'), 'time-error', validations.time);
        
        if (!isValid) {
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            if (data.success) {
                window.location.href = 'thank-you.html';
            } else {
                throw new Error('Email sending failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was a problem submitting the form. Please try again or contact us directly.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Schedule Appointment';
        });
    });
});