/**
 * Comprehensive Cities Database with Latitudes, Longitudes and Timezones
 * Preloaded with 100+ top Indian and global cities for instant 0ms offline lookup.
 */

export interface CityInfo {
  id?: number;
  timeZone?: string;
  countryCode?: string;
  elevation?: number;
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g. +5.5 for IST
  aliases?: string[];
}

export const CITIES_DATABASE: CityInfo[] = [
  // ─── Major Indian Metros & Capitals ───
  { name: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, aliases: ['Delhi', 'NCR', 'Dilli'] },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5, aliases: ['Bombay'] },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, aliases: ['Bangalore'] },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, aliases: ['Calcutta'] },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, aliases: ['Madras'] },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 5.5, aliases: ['Secunderabad'] },
  { name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezone: 5.5, aliases: ['Poona'] },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 5.5, aliases: ['Amdavad'] },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5, aliases: ['Pink City'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezone: 5.5 },
  { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319, timezone: 5.5 },
  { name: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezone: 5.5 },
  { name: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezone: 5.5 },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, timezone: 5.5 },
  { name: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezone: 5.5, aliases: ['Pataliputra'] },
  { name: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezone: 5.5 },
  { name: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812, timezone: 5.5, aliases: ['Baroda'] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, timezone: 5.5, aliases: ['Vizag'] },
  { name: 'Ludhiana', state: 'Punjab', country: 'India', latitude: 30.9010, longitude: 75.8573, timezone: 5.5 },
  { name: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723, timezone: 5.5 },
  { name: 'Chandigarh', state: 'Chandigarh', country: 'India', latitude: 30.7333, longitude: 76.7794, timezone: 5.5 },
  { name: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.3165, longitude: 78.0322, timezone: 5.5 },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734, timezone: 5.5 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973, timezone: 5.5 },
  { name: 'Jammu', state: 'Jammu and Kashmir', country: 'India', latitude: 32.7266, longitude: 74.8570, timezone: 5.5 },
  { name: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezone: 5.5 },
  { name: 'Bhubaneswar', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, timezone: 5.5 },
  { name: 'Cuttack', state: 'Odisha', country: 'India', latitude: 20.4625, longitude: 85.8828, timezone: 5.5 },
  { name: 'Ranchi', state: 'Jharkhand', country: 'India', latitude: 23.3441, longitude: 85.3096, timezone: 5.5 },
  { name: 'Jamshedpur', state: 'Jharkhand', country: 'India', latitude: 22.8046, longitude: 86.2029, timezone: 5.5, aliases: ['Tatanagar'] },
  { name: 'Raipur', state: 'Chhattisgarh', country: 'India', latitude: 21.2514, longitude: 81.6296, timezone: 5.5 },
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, timezone: 5.5, aliases: ['Trivandrum'] },
  { name: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezone: 5.5, aliases: ['Cochin', 'Ernakulam'] },
  { name: 'Kozhikode', state: 'Kerala', country: 'India', latitude: 11.2588, longitude: 75.7804, timezone: 5.5, aliases: ['Calicut'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, timezone: 5.5 },
  { name: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, timezone: 5.5 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', latitude: 10.7905, longitude: 78.7047, timezone: 5.5, aliases: ['Trichy'] },
  { name: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394, timezone: 5.5, aliases: ['Mysore'] },
  { name: 'Mangaluru', state: 'Karnataka', country: 'India', latitude: 12.9141, longitude: 74.8560, timezone: 5.5, aliases: ['Mangalore'] },
  { name: 'Hubli', state: 'Karnataka', country: 'India', latitude: 15.3647, longitude: 75.1240, timezone: 5.5, aliases: ['Hubballi'] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, timezone: 5.5 },
  { name: 'Guntur', state: 'Andhra Pradesh', country: 'India', latitude: 16.3067, longitude: 80.4365, timezone: 5.5 },
  { name: 'Warangal', state: 'Telangana', country: 'India', latitude: 17.9689, longitude: 79.5941, timezone: 5.5 },
  { name: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910, timezone: 5.5 },
  { name: 'Greater Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.4744, longitude: 77.5040, timezone: 5.5 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', latitude: 28.6692, longitude: 77.4538, timezone: 5.5 },
  { name: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4595, longitude: 77.0266, timezone: 5.5, aliases: ['Gurgaon'] },
  { name: 'Faridabad', state: 'Haryana', country: 'India', latitude: 28.4089, longitude: 77.3178, timezone: 5.5 },
  { name: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081, timezone: 5.5 },
  { name: 'Meerut', state: 'Uttar Pradesh', country: 'India', latitude: 28.9845, longitude: 77.7064, timezone: 5.5 },
  { name: 'Bareilly', state: 'Uttar Pradesh', country: 'India', latitude: 28.3670, longitude: 79.4304, timezone: 5.5 },
  { name: 'Aligarh', state: 'Uttar Pradesh', country: 'India', latitude: 27.8974, longitude: 78.0880, timezone: 5.5 },
  { name: 'Moradabad', state: 'Uttar Pradesh', country: 'India', latitude: 28.8351, longitude: 78.7738, timezone: 5.5 },
  { name: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243, timezone: 5.5 },
  { name: 'Kota', state: 'Rajasthan', country: 'India', latitude: 25.2138, longitude: 75.8648, timezone: 5.5 },
  { name: 'Bikaner', state: 'Rajasthan', country: 'India', latitude: 28.0229, longitude: 73.3119, timezone: 5.5 },
  { name: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125, timezone: 5.5 },
  { name: 'Ajmer', state: 'Rajasthan', country: 'India', latitude: 26.4499, longitude: 74.6399, timezone: 5.5 },
  { name: 'Gwalior', state: 'Madhya Pradesh', country: 'India', latitude: 26.2183, longitude: 78.1828, timezone: 5.5 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', latitude: 23.1815, longitude: 79.9864, timezone: 5.5 },
  { name: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898, timezone: 5.5, aliases: ['Nasik'] },
  { name: 'Aurangabad', state: 'Maharashtra', country: 'India', latitude: 19.8762, longitude: 75.3433, timezone: 5.5, aliases: ['Chhatrapati Sambhajinagar'] },
  { name: 'Solapur', state: 'Maharashtra', country: 'India', latitude: 17.6599, longitude: 75.9064, timezone: 5.5 },
  { name: 'Kolhapur', state: 'Maharashtra', country: 'India', latitude: 16.7050, longitude: 74.2433, timezone: 5.5 },
  { name: 'Navi Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0330, longitude: 73.0297, timezone: 5.5 },
  { name: 'Thane', state: 'Maharashtra', country: 'India', latitude: 19.2183, longitude: 72.9781, timezone: 5.5 },
  { name: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022, timezone: 5.5 },
  { name: 'Bhavnagar', state: 'Gujarat', country: 'India', latitude: 21.7645, longitude: 72.1519, timezone: 5.5 },
  { name: 'Jamnagar', state: 'Gujarat', country: 'India', latitude: 22.4707, longitude: 70.0577, timezone: 5.5 },
  { name: 'Panaji', state: 'Goa', country: 'India', latitude: 15.4909, longitude: 73.8278, timezone: 5.5, aliases: ['Goa'] },

  // ─── Holy & Sacred Vedic Pilgrimage Cities ───
  { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, aliases: ['Banaras', 'Kashi'] },
  { name: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', latitude: 25.4358, longitude: 81.8463, timezone: 5.5, aliases: ['Allahabad', 'Triveni Sangam'] },
  { name: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998, timezone: 5.5, aliases: ['Ram Janmabhoomi'] },
  { name: 'Mathura', state: 'Uttar Pradesh', country: 'India', latitude: 27.4924, longitude: 77.6737, timezone: 5.5, aliases: ['Braj'] },
  { name: 'Vrindavan', state: 'Uttar Pradesh', country: 'India', latitude: 27.5806, longitude: 77.7006, timezone: 5.5 },
  { name: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5 },
  { name: 'Rishikesh', state: 'Uttarakhand', country: 'India', latitude: 30.0869, longitude: 78.2676, timezone: 5.5 },
  { name: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5, aliases: ['Mahakaleshwar', 'Avantika'] },
  { name: 'Puri', state: 'Odisha', country: 'India', latitude: 19.8135, longitude: 85.8312, timezone: 5.5, aliases: ['Jagannath Puri'] },
  { name: 'Dwarka', state: 'Gujarat', country: 'India', latitude: 22.2442, longitude: 68.9685, timezone: 5.5 },
  { name: 'Rameswaram', state: 'Tamil Nadu', country: 'India', latitude: 9.2876, longitude: 79.3129, timezone: 5.5 },
  { name: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, timezone: 5.5, aliases: ['Tirumala'] },
  { name: 'Kedarnath', state: 'Uttarakhand', country: 'India', latitude: 30.7346, longitude: 79.0669, timezone: 5.5 },
  { name: 'Badrinath', state: 'Uttarakhand', country: 'India', latitude: 30.7433, longitude: 79.4938, timezone: 5.5 },
  { name: 'Shirdi', state: 'Maharashtra', country: 'India', latitude: 19.7667, longitude: 74.4762, timezone: 5.5 },

  // ─── Major Global Capitals & Diaspora Cities ───
  { name: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 0 },
  { name: 'New York', state: 'NY', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: -5, aliases: ['NYC', 'Manhattan'] },
  { name: 'San Francisco', state: 'CA', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: -8, aliases: ['Bay Area', 'SF', 'Silicon Valley'] },
  { name: 'Los Angeles', state: 'CA', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: -8, aliases: ['LA'] },
  { name: 'Chicago', state: 'IL', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: -6 },
  { name: 'Dallas', state: 'TX', country: 'United States', latitude: 32.7767, longitude: -96.7970, timezone: -6 },
  { name: 'Houston', state: 'TX', country: 'United States', latitude: 29.7604, longitude: -95.3698, timezone: -6 },
  { name: 'Seattle', state: 'WA', country: 'United States', latitude: 47.6062, longitude: -122.3321, timezone: -8 },
  { name: 'Toronto', state: 'ON', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: -5 },
  { name: 'Vancouver', state: 'BC', country: 'Canada', latitude: 49.2827, longitude: -123.1207, timezone: -8 },
  { name: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 4, aliases: ['UAE'] },
  { name: 'Abu Dhabi', state: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 4 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8 },
  { name: 'Sydney', state: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10 },
  { name: 'Melbourne', state: 'VIC', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 10 },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, timezone: 12 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 9 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 1 },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 1 },
  { name: 'Kathmandu', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timezone: 5.75 },
  { name: 'Colombo', country: 'Sri Lanka', latitude: 6.9271, longitude: 79.8612, timezone: 5.5 },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 6 },
  { name: 'Port Louis', country: 'Mauritius', latitude: -20.1609, longitude: 57.5012, timezone: 4 },
  { name: 'Suva', country: 'Fiji', latitude: -18.1416, longitude: 178.4419, timezone: 12 },
];

/**
 * Searches the built-in database for matching cities with fuzzy & alias support
 */
export function searchLocalCities(query: string, limit: number = 8): CityInfo[] {
  if (!query || query.trim().length === 0) {
    return CITIES_DATABASE.slice(0, limit);
  }

  const q = query.trim().toLowerCase();

  const results: { city: CityInfo; score: number }[] = [];

  for (const city of CITIES_DATABASE) {
    let score = 0;
    const nameLower = city.name.toLowerCase();
    const stateLower = (city.state || '').toLowerCase();
    const countryLower = city.country.toLowerCase();

    if (nameLower === q) {
      score += 100;
    } else if (nameLower.startsWith(q)) {
      score += 50;
    } else if (nameLower.includes(q)) {
      score += 30;
    }

    if (city.aliases) {
      for (const alias of city.aliases) {
        const aLower = alias.toLowerCase();
        if (aLower === q) score += 90;
        else if (aLower.startsWith(q)) score += 45;
        else if (aLower.includes(q)) score += 25;
      }
    }

    if (stateLower.includes(q)) score += 15;
    if (countryLower.includes(q)) score += 10;

    if (score > 0) {
      results.push({ city, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.city);
}
