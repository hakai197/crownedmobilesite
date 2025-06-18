/**
 * Distance Calculator for Crowned Mobile
 * Handles both API-based and fallback distance calculations
 */
class DistanceCalculator {
  constructor(options = {}) {
    // Configuration with defaults
    this.baseZip = options.baseZip || '45177'; // Wilmington, OH
    this.apiKey = options.apiKey || 'saIt3PXAfWQDhW9gxAwshRoNK1DJPeEcRDWFYyoS2OSxwbEK2pSXlTiPLJXpdc3S'; // Use the same client key as in the example
    this.freeMiles = options.freeMiles || 30;
    this.costPerMile = options.costPerMile || 2;
    this.maxMiles = options.maxMiles || 200;
    this.cache = {};
    
    // Ohio zip code regions for better approximation
    this.ohioRegions = {
      'central': [[43000, 43299], [45000, 45299]],
      'northeast': [[44000, 44999]],
      'southwest': [[45300, 45599]],
      'southeast': [[45600, 45799]],
      'northwest': [[45800, 45899], [43300, 43499]]
    };
    
    // Known distances from base zip (45177) for common locations
    this.knownDistances = {
      '43085': 55,  // Dublin
      '43240': 77,  // Columbus
      '45202': 35,  // Cincinnati
      '44102': 195, // Cleveland
      '45801': 110  // Lima
    };
  }

  async calculate(zipcode) {
    if (!/^\d{5}$/.test(zipcode)) {
      throw new Error('Please enter a valid 5-digit zip code');
    }

    try {
      // Try API first
      const miles = await this.calculateWithAPI(zipcode);
      return this.calculateFee(miles);
    } catch (apiError) {
      console.warn('API failed, using fallback:', apiError);
      // Fallback to improved Ohio approximation
      const miles = this.calculateOhioDistance(zipcode);
      return this.calculateFee(miles);
    }
  }

  async calculateWithAPI(zipcode) {
    const cacheKey = `${this.baseZip}-${zipcode}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey].distance;
    }

    const url = `https://www.zipcodeapi.com/rest/${this.apiKey}/distance.json/${this.baseZip}/${zipcode}/mile`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error_msg) {
        throw new Error(data.error_msg);
      }

      if (!data.distance) {
        throw new Error('Invalid response format from API');
      }

      // Store in cache
      this.cache[cacheKey] = data;
      
      return Math.round(data.distance);
    } catch (error) {
      console.error('API Call Failed:', error);
      throw error;
    }
  }

  calculateOhioDistance(zipcode) {
    // Check known distances first
    if (this.knownDistances[zipcode]) {
      return this.knownDistances[zipcode];
    }

    const baseNum = parseInt(this.baseZip);
    const targetNum = parseInt(zipcode);
    const diff = Math.abs(targetNum - baseNum);
    
    // Determine region of target zipcode
    let region = 'central';
    for (const [reg, ranges] of Object.entries(this.ohioRegions)) {
      for (const [min, max] of ranges) {
        if (targetNum >= min && targetNum <= max) {
          region = reg;
          break;
        }
      }
    }

    // Region-specific calculations
    const regionFactors = {
      'central': 0.12,
      'northeast': 0.18,
      'southwest': 0.10,
      'southeast': 0.15,
      'northwest': 0.14
    };

    // Calculate approximate miles
    let miles = Math.round(diff * regionFactors[region]);
    
    // Ensure reasonable bounds
    miles = Math.max(5, Math.min(miles, this.maxMiles));
    
    console.log(`Approximate distance from ${this.baseZip} to ${zipcode}: ${miles} miles (${region} region)`);
    return miles;
  }

  calculateFee(miles) {
    const excessMiles = Math.max(0, miles - this.freeMiles);
    return {
      miles: miles,
      fee: excessMiles * this.costPerMile,
      excessMiles: excessMiles,
      freeMiles: this.freeMiles,
      ratePerMile: this.costPerMile
    };
  }
}

// Initialize calculator with default configuration
const distanceCalculator = new DistanceCalculator();

/**
 * Pricing Page Implementation
 */
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
      const result = await distanceCalculator.calculate(zip);
      console.log('Calculation Result:', result);
      
      // Update UI
      document.getElementById('miles').textContent = result.miles;
      document.getElementById('travelFee').textContent = result.fee;
      document.getElementById('excessMiles').textContent = result.excessMiles;
      document.getElementById('distanceResult').classList.remove('hidden');
      
      // Update package prices
      document.querySelectorAll('.pricing-list .total').forEach(totalEl => {
        const basePrice = parseFloat(
          totalEl.closest('li').querySelector('.price')
          .textContent.replace(/[^\d.]/g, '')
        );
        totalEl.textContent = (basePrice + result.fee).toFixed(0);
      });
      
      // Store for appointment page
      localStorage.setItem('travelDetails', JSON.stringify({
        zip: zip,
        distance: result.miles,
        fee: result.fee,
        excessMiles: result.excessMiles,
        calculatedAt: new Date().getTime()
      }));

    } catch (error) {
      console.error('Distance calculation failed:', error);
      alert(error.message || 'Could not calculate distance. Please try again or call us.');
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  setupPricingCalculator();
});