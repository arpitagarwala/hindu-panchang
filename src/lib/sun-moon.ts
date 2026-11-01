/**
 * Sun & Moon calculations using SunCalc library.
 * SunCalc docs: https://github.com/mourner/suncalc
 */

import * as SunCalc from 'suncalc';

export interface SunPosition {
  altitude: number;    // radians
  azimuth: number;     // radians (south = 0, clockwise)
  altitudeDegrees: number;
  azimuthDegrees: number; // 0 = north, clockwise
}

export interface MoonPosition {
  altitude: number;
  azimuth: number;
  altitudeDegrees: number;
  azimuthDegrees: number;
  distance: number;     // km
  parallacticAngle: number;
}

export interface MoonIllumination {
  fraction: number;    // 0–1 illuminated fraction
  phase: number;       // 0–1 phase (0 = new, 0.5 = full)
  angle: number;       // midpoint angle of illuminated limb
}

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  nadir: Date | null;
  goldenHourEnd: Date | null;
  goldenHour: Date | null;
  blueHourEnd: Date | null;
  blueHour: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  nightEnd: Date | null;
  night: Date | null;
}

export interface MoonTimes {
  rise: Date | null;
  set: Date | null;
  alwaysUp: boolean;
  alwaysDown: boolean;
}

export function getSunPosition(date: Date, lat: number, lon: number): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lon);
  return {
    altitude: pos.altitude,
    azimuth: pos.azimuth,
    altitudeDegrees: pos.altitude * (180 / Math.PI),
    // SunCalc azimuth is from south, clockwise. Convert to north-based:
    azimuthDegrees: ((pos.azimuth * (180 / Math.PI)) + 180) % 360,
  };
}

export function getMoonPosition(date: Date, lat: number, lon: number): MoonPosition {
  const pos = SunCalc.getMoonPosition(date, lat, lon);
  return {
    altitude: pos.altitude,
    azimuth: pos.azimuth,
    altitudeDegrees: pos.altitude * (180 / Math.PI),
    azimuthDegrees: ((pos.azimuth * (180 / Math.PI)) + 180) % 360,
    distance: pos.distance,
    parallacticAngle: pos.parallacticAngle,
  };
}

export function getMoonIllumination(date: Date): MoonIllumination {
  const illum = SunCalc.getMoonIllumination(date);
  return {
    fraction: illum.fraction,
    phase: illum.phase,
    angle: illum.angle,
  };
}

export function getSunTimes(date: Date, lat: number, lon: number): SunTimes {
  const times = SunCalc.getTimes(date, lat, lon);
  return {
    sunrise: times.sunrise ?? null,
    sunset: times.sunset ?? null,
    solarNoon: times.solarNoon ?? null,
    nadir: times.nadir ?? null,
    goldenHourEnd: times.goldenHourEnd ?? null,
    goldenHour: times.goldenHour ?? null,
    blueHourEnd: (times as Record<string, Date | null>).blueHourEnd ?? null,
    blueHour: (times as Record<string, Date | null>).blueHour ?? null,
    dawn: times.dawn ?? null,
    dusk: times.dusk ?? null,
    nauticalDawn: times.nauticalDawn ?? null,
    nauticalDusk: times.nauticalDusk ?? null,
    nightEnd: times.nightEnd ?? null,
    night: times.night ?? null,
  };
}

export function getMoonTimes(date: Date, lat: number, lon: number): MoonTimes {
  const times = SunCalc.getMoonTimes(date, lat, lon);
  return {
    rise: times.rise ?? null,
    set: times.set ?? null,
    alwaysUp: times.alwaysUp ?? false,
    alwaysDown: times.alwaysDown ?? false,
  };
}

/** Returns 0–1 progress of day (0 = sunrise, 1 = sunset) */
export function getDayProgress(now: Date, sunrise: Date, sunset: Date): number {
  const total = sunset.getTime() - sunrise.getTime();
  const elapsed = now.getTime() - sunrise.getTime();
  return Math.max(0, Math.min(1, elapsed / total));
}

/** Returns sun X position on a 0–1 arc for display purposes */
export function getSunArcPosition(dayProgress: number): { x: number; y: number } {
  // Parabolic arc: x from 0→1, y = sin(progress * π) for peak at noon
  const angle = dayProgress * Math.PI;
  return {
    x: dayProgress,
    y: Math.sin(angle),
  };
}

/** Format seconds duration as "Xh Ym" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/** Format time in 12-hour format */
export function formatTime12h(date: Date, timezone?: string): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}
