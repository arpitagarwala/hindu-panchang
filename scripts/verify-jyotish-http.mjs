import assert from "node:assert/strict";
const base = process.env.PANCHANG_TEST_URL || "http://localhost:3000";
const input = {
  name: "Synthetic validation",
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
let checks = 0;
const check = (v, m) => {
  assert.ok(v, m);
  checks++;
};
const page = await fetch(`${base}/jyotish`),
  html = await page.text();
check(
  page.ok && html.includes("A clearer view of your Kundali"),
  "Page renders",
);
check(
  html.includes("Free Kundali") && html.includes('rel="canonical"'),
  "Kundali metadata",
);
check(
  !html.includes("1998-08-15"),
  "No sample birth chart pretends to be the visitor",
);
const post = (body, origin) =>
  fetch(`${base}/api/jyotish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify(body),
  });
const response = await post(input, new URL(base).origin),
  r = await response.json();
check(response.ok, "Birth report generates over HTTP");
check(
  response.headers.get("cache-control")?.includes("no-store"),
  "Birth data excluded from CDN caching",
);
check(
  response.headers.get("x-robots-tag")?.includes("noindex"),
  "API excluded from indexing",
);
check(
  r.birthInstant === "1998-08-15T09:00:00.000Z",
  "Historical conversion exactly once",
);
check(
  r.chart.ascendant.sign === 8 && r.chart.planets.Moon.sign === 2,
  "Correct regression chart",
);
check(Object.keys(r.vargas).length === 14, "14 charts");
check(
  r.forecast.length === 12 && r.readings.length === 6,
  "Forecast and guidance",
);
check(
  r.day.windows.length === 5 && r.day.timeZone === "Asia/Kolkata",
  "Daily windows calculated for residence",
);
const invalid = await post({ ...input, timeZone: "invalid" });
check(invalid.status === 400, "Invalid zone is a validation error");
const ambiguous = await post({
  ...input,
  date: "2021-11-07",
  time: "01:30",
  timeZone: "America/New_York",
});
check(ambiguous.status === 400, "Repeated local time requires explicit choice");
const disallowed = await post(input, "https://example.invalid");
check(disallowed.status === 403, "Cross-origin form request rejected");
const get = await fetch(`${base}/api/jyotish`);
check(get.status === 405, "Personal birth data is POST-only");
console.log(`Passed ${checks} deployed Kundali HTTP checks.`);
