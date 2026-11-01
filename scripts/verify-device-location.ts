import assert from 'node:assert/strict';
import { detectDeviceLocation } from '../src/lib/geo/device-location';

async function main() {
  let requests = 0;
  let deviceCalls = 0;
  const options: PositionOptions[] = [];
  const device = { getCurrentPosition(success: PositionCallback, _error?: PositionErrorCallback | null, settings?: PositionOptions) {
    deviceCalls++;
    options.push(settings!);
    success({ coords: { latitude: 0, longitude: 0 } } as GeolocationPosition);
  } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: true } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { geolocation: device } });
  globalThis.fetch = async input => {
    requests++;
    assert.equal(String(input), '/api/geocode?lat=0&lon=0');
    return Response.json({ timeZone: 'Etc/GMT' });
  };
  const result = await detectDeviceLocation();
  assert.equal(result.latitude, 0); assert.equal(result.longitude, 0); assert.equal(result.timeZone, 'Etc/GMT');
  assert.equal(options[0].enableHighAccuracy, false); assert.equal(options[0].timeout, 12000);
  assert.equal(requests, 1);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(() => detectDeviceLocation(controller.signal), { name: 'AbortError' });
  assert.equal(deviceCalls, 1, 'Already-cancelled requests never ask for device permission');
  assert.equal(requests, 1, 'Cancelled detection never sends coordinates');
  let latePosition: PositionCallback | undefined;
  device.getCurrentPosition = success => { latePosition = success; };
  const pendingController = new AbortController();
  const pending = detectDeviceLocation(pendingController.signal);
  pendingController.abort();
  await assert.rejects(() => pending, { name: 'AbortError' });
  latePosition!({ coords: { latitude: 0, longitude: 0 } } as GeolocationPosition);
  await Promise.resolve();
  assert.equal(requests, 1, 'A late device response after cancellation never sends coordinates');
  device.getCurrentPosition = (_success, error) => error!({ code: 1 } as GeolocationPositionError);
  await assert.rejects(() => detectDeviceLocation(), /permission is off/);
  assert.equal(requests, 1, 'Permission denial never sends coordinates');
  device.getCurrentPosition = (_success, error) => error!({ code: 3 } as GeolocationPositionError);
  await assert.rejects(() => detectDeviceLocation(), /timed out/);
  device.getCurrentPosition = success => success({ coords: { latitude: 95, longitude: 0 } } as GeolocationPosition);
  await assert.rejects(() => detectDeviceLocation(), /invalid coordinates/);
  device.getCurrentPosition = success => success({ coords: { latitude: 0, longitude: 0 } } as GeolocationPosition);
  globalThis.fetch = async () => Response.json({ timeZone: 'invalid-zone' });
  await assert.rejects(() => detectDeviceLocation(), RangeError);
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(() => detectDeviceLocation(), /time zone could not be determined/);
  Object.defineProperty(globalThis, 'window', { value: { isSecureContext: false } });
  await assert.rejects(() => detectDeviceLocation(), /HTTPS/);
  console.log('Device location checks passed: zero coordinates, local-only lookup, timeout, denial, cancellation, invalid coordinates, invalid zone, server failure and HTTPS requirement. Browser permission UI still needs a real-device check.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
