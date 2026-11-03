import assert from "node:assert/strict";
import * as Astronomy from "astronomy-engine";
import {
  resolveBirthTime,
  BirthInputError,
} from "../src/lib/jyotish/birth-time";
import {
  createJyotishReport,
  validateInput,
  swissPositions,
} from "../src/lib/jyotish/server";
import {
  calculateVargaSign,
  VARGA_INFO,
  type VargaType,
} from "../src/lib/astronomy/vargas";
import { calculateVimshottariDasha } from "../src/lib/astronomy/dasha";
import { reportHtml } from "../src/lib/jyotish/export";
import type { BirthInput } from "../src/lib/jyotish/types";
import { northLabels } from "../src/lib/jyotish/chart-layout";
let checks = 0;
function check(value: unknown, message: string) {
  assert.ok(value, message);
  checks++;
}
const fixture: BirthInput = {
  name: "Synthetic test",
  date: "1998-08-15",
  time: "14:30",
  place: "Delhi",
  latitude: 28.6139,
  longitude: 77.209,
  timeZone: "Asia/Kolkata",
  overlap: "reject",
  uncertaintyMinutes: 5,
  node: "mean",
  targetDate: "2026-11-04",
  residence: {
    place: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    timeZone: "Asia/Kolkata",
  },
};
check(
  new Date(
    resolveBirthTime(fixture.date, fixture.time, fixture.timeZone).instant,
  ).toISOString() === "1998-08-15T09:00:00.000Z",
  "Birth time converted exactly once",
);
for (const [date, expected] of [
  ["2000-07-01", -240],
  ["2000-01-01", -300],
] as const)
  check(
    resolveBirthTime(date, "12:00", "America/New_York").offsetMinutes ===
      expected,
    "Historical DST, not today’s offset",
  );
assert.throws(
  () => resolveBirthTime("2021-03-14", "02:30", "America/New_York"),
  BirthInputError,
);
checks++;
assert.throws(
  () => resolveBirthTime("2021-11-07", "01:30", "America/New_York"),
  BirthInputError,
);
checks++;
check(
  resolveBirthTime("2021-11-07", "01:30", "America/New_York", "later").instant -
    resolveBirthTime("2021-11-07", "01:30", "America/New_York", "earlier")
      .instant ===
    3600000,
  "Repeated clock time needs explicit choice",
);
assert.throws(
  () => resolveBirthTime("2023-10-01", "02:15", "Australia/Lord_Howe"),
  BirthInputError,
);
checks++;
assert.throws(
  () => resolveBirthTime("2011-12-30", "12:00", "Pacific/Apia"),
  BirthInputError,
);
checks++;
check(
  resolveBirthTime("1900-01-01", "12:00", "Asia/Kolkata").offsetMinutes ===
    321 + 10 / 60,
  "Historical second-level offset retained",
);
for (const patch of [
  { latitude: NaN },
  { longitude: 181 },
  { date: "2001-02-29" },
  { time: "25:00" },
  { timeZone: "invalid" },
  { uncertaintyMinutes: 121 },
  { targetDate: "1997-08-15" },
  { node: "other" },
  { residence: null },
]) {
  assert.throws(() => validateInput({ ...fixture, ...patch }), BirthInputError);
  checks++;
}
const boundaries: [VargaType, number, number][] = [
  ["D2", 14.999999, 5],
  ["D2", 15, 4],
  ["D2", 30, 4],
  ["D2", 45, 5],
  ["D3", 10, 5],
  ["D4", 7.5, 4],
  ["D7", 30, 8],
  ["D9", 30, 10],
  ["D9", 40, 1],
  ["D10", 30, 10],
  ["D10", 33, 11],
  ["D12", 32.5, 3],
  ["D16", 30, 5],
  ["D20", 30, 9],
  ["D24", 30, 4],
  ["D27", 30, 4],
  ["D30", 5, 11],
  ["D30", 10, 9],
  ["D30", 35, 6],
  ["D30", 42, 12],
  ["D60", 30.5, 3],
];
for (const [varga, lon, expected] of boundaries)
  check(
    calculateVargaSign(lon, varga) === expected,
    `${varga} boundary ${lon}`,
  );
for (const varga of Object.keys(VARGA_INFO) as VargaType[])
  for (let lon = -360; lon <= 720; lon += 0.37) {
    const sign = calculateVargaSign(lon, varga);
    check(Number.isInteger(sign) && sign >= 1 && sign <= 12, `${varga} bounds`);
  }
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("Unexpected external request");
};
const start = performance.now(),
  report = createJyotishReport(validateInput(fixture));
check(Object.keys(report.vargas).length === 14, "All 14 divisional charts");
check(
  report.forecast.length === 12 &&
    report.forecast.every((r, i, a) => !i || r.date > a[i - 1].date),
  "Twelve ordered monthly snapshots",
);
check(
  report.dasha.current.path === "Rahu / Mercury / Mars",
  "Frozen regression for synthetic birth, not an independent certification",
);
check(
  report.chart.ascendant.sign === 8 && report.chart.planets.Moon.sign === 2,
  "Regression birth positions",
);
check(
  report.sensitivity.some((x) => x.changed) && report.sensitivity.length === 14,
  "Birth-time sensitivity reported",
);
for (const v of Object.values(report.vargas))
  for (const label of northLabels(v, true))
    check(
      label.x > 0 && label.x < 500 && label.y > 0 && label.y < 500,
      "Crowded chart labels stay inside the drawing",
    );
for (const p of Object.values(report.chart.planets)) {
  check(
    p.house === ((p.sign - report.chart.ascendant.sign + 12) % 12) + 1,
    "Whole-sign house mapping",
  );
  check(
    p.pada >= 1 && p.pada <= 4 && p.degreeInSign >= 0 && p.degreeInSign < 30,
    "Degree and pada bounds",
  );
}
check(
  Math.abs(
    ((report.chart.planets.Ketu.siderealLon -
      report.chart.planets.Rahu.siderealLon +
      360) %
      360) -
      180,
  ) < 1e-9,
  "Nodes remain opposite",
);
const trueNodes = swissPositions(Date.parse(report.birthInstant), "true");
check(
  Math.abs(trueNodes.Rahu.siderealLon - report.chart.planets.Rahu.siderealLon) >
    0.01,
  "Mean/true node settings differ",
);
// Independent low-cost astronomical sanity comparison, not an arcsecond claim.
const instant = new Date(report.birthInstant),
  sun = Astronomy.SunPosition(instant).elon,
  moon = Astronomy.EclipticGeoMoon(instant).lon;
const distance = (a: number, b: number) =>
  Math.abs(((a - b + 540) % 360) - 180);
check(
  distance(sun, report.chart.planets.Sun.tropicalLon) < 0.03,
  "Sun sanity check against Astronomy Engine",
);
check(
  distance(moon, report.chart.planets.Moon.tropicalLon) < 0.03,
  "Moon sanity check against Astronomy Engine",
);
for (const scenario of [
  {
    ...fixture,
    date: "2003-06-26",
    time: "07:54",
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    ...fixture,
    date: "2000-01-01",
    time: "01:30",
    latitude: -33.8688,
    longitude: 151.2093,
    timeZone: "Australia/Sydney",
  },
  {
    ...fixture,
    date: "1947-08-15",
    time: "00:00",
    latitude: 0,
    longitude: 0,
    timeZone: "Etc/UTC",
  },
  { ...fixture, date: "1900-01-01", time: "00:00", targetDate: "2019-01-01" },
  {
    ...fixture,
    residence: {
      place: "Polar test",
      latitude: 78.22,
      longitude: 15.65,
      timeZone: "Arctic/Longyearbyen",
    },
    targetDate: "2026-12-15",
  },
]) {
  const r = createJyotishReport(validateInput(scenario));
  check(
    r.chart.houses.length === 12 && Object.keys(r.chart.planets).length === 9,
    "Geographic/date scenarios retain full chart",
  );
  if (scenario.residence.place === "Polar test")
    check(
      r.day.windows.length === 0 && !r.day.sunrise,
      "No invented polar timing windows",
    );
}
const birthDate = new Date("2000-01-01T00:00:00Z"),
  d = calculateVimshottariDasha(
    birthDate,
    13.3,
    new Date("2119-01-01T00:00:00Z"),
    3,
  );
check(
  Date.parse(d.currentDasha.mahadasha.startDate) <= Date.parse("2119-01-01"),
  "Late-life dasha does not fall back to birth period",
);
for (const md of d.mahadashas) {
  check(
    md.subPeriods?.every(
      (p, i, a) =>
        !i ||
        Math.abs(Date.parse(p.startDate) - Date.parse(a[i - 1].endDate)) < 2,
    ),
    "Antardasha continuity",
  );
}
assert.throws(
  () =>
    calculateVimshottariDasha(
      birthDate,
      13.3,
      new Date("1999-01-01T00:00:00Z"),
    ),
  RangeError,
);
checks++;
for (const hi of [false, true]) {
  const html = reportHtml(
    {
      ...report,
      input: { ...report.input, name: "<script>alert(1)</script>" },
    },
    hi,
  );
  check(
    !html.includes("<script>") && !html.includes(" src="),
    "Standalone report escapes personal input and loads no assets",
  );
  check(
    (html.match(/<h2>D\d+/g) || []).length === 14,
    "Offline report has every chart",
  );
  check(
    (html.match(/<svg /g) || []).length === 14,
    "Offline report embeds all visual charts",
  );
  check(
    html.includes(hi ? "दशा समयरेखा" : "Dasha timeline"),
    "Bilingual offline report",
  );
}
globalThis.fetch = originalFetch;
console.log(
  `Passed ${checks} Jyotish checks: historical/DST birth times, varga boundaries, report completeness, geography, dasha continuity, no external requests, and escaped bilingual exports. Sample compute: ${(performance.now() - start).toFixed(0)} ms including all test reports.`,
);
