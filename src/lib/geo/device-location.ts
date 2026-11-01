import type { CityInfo } from './cities';

/** Permission-based, one-shot detection. Coordinates only go to our time-zone endpoint. */
export async function detectDeviceLocation(signal?: AbortSignal): Promise<CityInfo> {
  signal?.throwIfAborted();
  if (!window.isSecureContext) throw new Error('Location detection needs HTTPS. You can still search for your city.');
  if (!navigator.geolocation) throw new Error('This browser does not support location detection. Search for your city instead.');
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    const cleanup = () => signal?.removeEventListener('abort', abort);
    const abort = () => { cleanup(); reject(new DOMException('Location request cancelled.', 'AbortError')); };
    signal?.addEventListener('abort', abort, { once: true });
    navigator.geolocation.getCurrentPosition(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(new Error(
      error.code === 1 ? 'Location permission is off. Allow it in your browser settings, or choose a city.' :
      error.code === 3 ? 'Location detection timed out. Try again or choose a city.' : 'Your location could not be found. Try again or choose a city.'
    )); }, { timeout: 12000, maximumAge: 300000, enableHighAccuracy: false });
  });
  signal?.throwIfAborted();
  const latitude = position.coords.latitude, longitude = position.coords.longitude;
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new Error('Your device returned invalid coordinates. Choose a city instead.');
  const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Your time zone could not be determined. Please choose a city.');
  const { timeZone } = await response.json();
  if (typeof timeZone !== 'string') throw new Error('Your time zone could not be determined. Please choose a city.');
  new Intl.DateTimeFormat('en', { timeZone });
  return { name: 'Current location', country: '', latitude, longitude, timezone: 0, timeZone };
}
