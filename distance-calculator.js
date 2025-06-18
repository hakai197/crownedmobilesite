// distance-calculator.js
class DistanceCalculator {
  constructor(options = {}) {
    this.baseZip = options.baseZip || '45177';
    this.apiKey = options.apiKey || 'sqltXyYWihWzaFAifaVRN8NhYdcg6Ks0lCniNfQLV93gyADKhOWoJdSjyot4rql6';
    this.freeMiles = options.freeMiles || 30;
    this.costPerMile = options.costPerMile || 2;
    this.maxMiles = options.maxMiles || 200;
  }

  async calculate(zipcode) {
    if (!/^\d{5}$/.test(zipcode)) {
      throw new Error('Invalid zip code format');
    }

    try {
      // Try API first
      const miles = await this.calculateWithAPI(zipcode);
      return this.calculateFee(miles);
    } catch (apiError) {
      console.warn('API failed, using fallback:', apiError);
      // Fallback to approximate calculation
      const miles = this.calculateApproximate(zipcode);
      return this.calculateFee(miles);
    }
  }

  async calculateWithAPI(zipcode) {
    const response = await fetch(
      `https://www.zipcodeapi.com/rest/${this.apiKey}/distance.json/${this.baseZip}/${zipcode}/mile`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return Math.round(data.distance);
  }

  calculateApproximate(zipcode) {
    const zipDiff = Math.abs(parseInt(zipcode) - parseInt(this.baseZip));
    return Math.min(Math.max(this.freeMiles, Math.floor(zipDiff / 75)), this.maxMiles);
  }

  calculateFee(miles) {
    const excessMiles = Math.max(0, miles - this.freeMiles);
    return {
      miles: miles,
      fee: excessMiles * this.costPerMile,
      excessMiles: excessMiles
    };
  }
}

// Initialize with default configuration
const distanceCalculator = new DistanceCalculator();

// Pricing Page Implementation
function setupPricingCalculator() {
  const calculateBtn = document.getElementById('calculateBtn');
  const zipInput = document.getElementById('zipcode');
  const applyBtn = document.getElementById('applyToAppointment');

  if (!calculateBtn) return;

  calculateBtn.addEventListener('click', async function() {
    const zip = zipInput.value.trim();
    
    if (!zip) {
      alert('Please enter a zip code');
      return;
    }

    // UI Loading State
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';

    try {
      const { miles, fee } = await distanceCalculator.calculate(zip);
      
      // Update UI
      document.getElementById('miles').textContent = miles;
      document.getElementById('travelFee').textContent = fee;
      document.getElementById('distanceResult').classList.remove('hidden');
      
      // Update all package prices
      document.querySelectorAll('.pricing-list .total').forEach(totalEl => {
        const basePrice = parseFloat(
          totalEl.closest('li').querySelector('.price')
          .textContent.replace(/[^\d.]/g, '')
        );
        totalEl.textContent = (basePrice + fee).toFixed(0);
      });
      
      // Store for appointment page
      localStorage.setItem('travelDetails', JSON.stringify({
        zip: zip,
        distance: miles,
        fee: fee,
        calculatedAt: new Date().getTime()
      }));

    } catch (error) {
      console.error('Distance calculation failed:', error);
      alert('Could not calculate distance. Please try again or call us.');
    } finally {
      calculateBtn.disabled = false;
      calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Fee';
    }
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      const zip = zipInput.value.trim();
      if (!zip) {
        alert('Please calculate distance first');
        return;
      }
      window.location.href = 'appointment.html?zip=' + encodeURIComponent(zip);
    });
  }
}

// Appointment Page Implementation
function setupAppointmentPage() {
  const appointmentZip = document.getElementById('appointmentZip');
  if (!appointmentZip) return;

  // Check for URL parameter or stored data
  const urlParams = new URLSearchParams(window.location.search);
  const storedData = JSON.parse(localStorage.getItem('travelDetails') || '{}');
  
  // Only use data if it's less than 1 hour old
  const oneHour = 3600000;
  const isDataFresh = storedData.calculatedAt && 
                     (new Date().getTime() - storedData.calculatedAt) < oneHour;
  
  const zip = urlParams.get('zip') || (isDataFresh ? storedData.zip : '');
  
  if (zip) {
    appointmentZip.value = zip;
    document.getElementById('appointmentTravelFee').value = isDataFresh ? storedData.fee : 0;
    document.getElementById('appointmentDistance').value = isDataFresh ? storedData.distance : 0;
    
    // Add travel fee note to form
    const feeNote = document.createElement('div');
    feeNote.className = 'travel-fee-display';
    feeNote.innerHTML = `
      <i class="fas fa-road"></i> 
      Travel Fee: $${isDataFresh ? storedData.fee : 0} 
      (${isDataFresh ? storedData.distance : 0} miles from ${distanceCalculator.baseZip})
      ${!isDataFresh ? '<br><small>Note: Please recalculate if over 1 hour old</small>' : ''}
    `;
    document.querySelector('form').insertBefore(feeNote, document.querySelector('button[type="submit"]'));
  }
  
  // Allow manual zip entry
  appointmentZip.addEventListener('change', function() {
    if (this.value.trim().length === 5 && confirm('For accurate travel fee, would you like to visit the Pricing page to calculate?')) {
      window.location.href = 'index.html';
    }
  });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('calculateBtn')) {
    setupPricingCalculator();
  }
  if (document.getElementById('appointmentZip')) {
    setupAppointmentPage();
  }
});