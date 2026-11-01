import { CITIES_DATABASE } from './geo/cities';

const names = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Varanasi', 'Ujjain'];
export const SEO_CITIES = names.map(name => {
  const city = CITIES_DATABASE.find(city => city.name === name);
  if (!city) throw new Error(`Missing published city: ${name}`);
  return { ...city, timeZone: 'Asia/Kolkata', slug: name.toLowerCase().replaceAll(' ', '-') };
});
