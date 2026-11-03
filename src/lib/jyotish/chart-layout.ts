import type { VargaChartResult } from "../astronomy/vargas";
import { PLANETS } from "../astronomy/constants";
const centers = [
  [250, 120],
  [125, 55],
  [55, 125],
  [120, 250],
  [55, 375],
  [125, 445],
  [250, 380],
  [375, 445],
  [445, 375],
  [380, 250],
  [445, 125],
  [375, 55],
];
const shortHi: Record<string, string> = {
  Sun: "सू",
  Moon: "चं",
  Mars: "मं",
  Mercury: "बु",
  Jupiter: "गु",
  Venus: "शु",
  Saturn: "श",
  Rahu: "रा",
  Ketu: "के",
};
export function northLabels(chart: VargaChartResult, hi: boolean) {
  return centers.flatMap(([x, y], i) => {
    const ids = chart.bhavatHouses[i + 1],
      columns = ids.length > 4 ? 2 : 1,
      rows = Math.ceil(ids.length / columns),
      sign = ((chart.ascendantSign - 1 + i) % 12) + 1;
    return [
      {
        x,
        y: y - Math.max(1, rows) * 8 - 14,
        label: `${sign}${i === 0 ? " ↑" : ""}`,
        sign: true,
      },
      ...ids.map((id, j) => ({
        x: x + (columns === 1 ? 0 : (Math.floor(j / rows) * 2 - 1) * 18),
        y: y - (rows - 1) * 8 + 4 + (j % rows) * 16,
        label: hi ? shortHi[id] : PLANETS[id].glyph,
        sign: false,
      })),
    ];
  });
}
