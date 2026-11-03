import type { ChartCalculationResult } from "../astronomy/ephemeris";
import type { CurrentDashaHierarchy, DashaSpan } from "../astronomy/dasha";
import type { VargaChartResult, VargaType } from "../astronomy/vargas";

export type BirthInput = {
  name: string;
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  overlap: "reject" | "earlier" | "later";
  uncertaintyMinutes: number;
  node: "mean" | "true";
  targetDate: string;
  residence: {
    place: string;
    latitude: number;
    longitude: number;
    timeZone: string;
  };
};
export type Text = { en: string; hi: string };
export type Reading = {
  title: Text;
  body: Text;
  reason: Text;
  action: Text;
  caution: Text;
};
export type Period = Pick<DashaSpan, "planet" | "startDate" | "endDate"> & {
  subPeriods?: Pick<DashaSpan, "planet" | "startDate" | "endDate">[];
};
export type Transit = {
  planet: string;
  sign: number;
  houseFromMoon: number;
  retrograde: boolean;
  supportive: boolean;
};
export type JyotishReport = {
  version: 1;
  generatedAt: string;
  input: BirthInput;
  birthInstant: string;
  offsetMinutes: number;
  chart: ChartCalculationResult;
  vargas: Record<VargaType, VargaChartResult>;
  sensitivity: { varga: VargaType; changed: boolean }[];
  dasha: {
    current: CurrentDashaHierarchy;
    startingLord: string;
    balanceYears: number;
    periods: Period[];
  };
  readings: Reading[];
  forecast: {
    date: string;
    mahadasha: string;
    antardasha: string;
    transits: Transit[];
  }[];
  day: {
    date: string;
    place: string;
    timeZone: string;
    sunrise: string;
    sunset: string;
    warnings: string[];
    windows: {
      name: Text;
      start: string;
      end: string;
      kind: "support" | "caution";
    }[];
    tara: number;
    taraName: Text;
    taraSupportive: boolean;
    chandraHouse: number;
    chandraSupportive: boolean;
  };
  numerology: { birth: number; destiny: number };
};
