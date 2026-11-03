"use client";
import type { VargaChartResult } from "@/lib/astronomy/vargas";
import { planetHi, signHi } from "@/lib/jyotish/knowledge";
import { ZODIAC_SIGNS } from "@/lib/astronomy/constants";
import { northLabels } from "@/lib/jyotish/chart-layout";
import s from "./Jyotish.module.css";
const grid = [12, 1, 2, 3, 11, 0, 0, 4, 10, 0, 0, 5, 9, 8, 7, 6];
export default function DivisionalChart({
  chart,
  hi,
  style,
  onStyle,
}: {
  chart: VargaChartResult;
  hi: boolean;
  style: "north" | "south";
  onStyle: (value: "north" | "south") => void;
}) {
  return (
    <>
      <div className={s.inline}>
        <button
          aria-pressed={style === "north"}
          onClick={() => onStyle("north")}
        >
          {hi ? "उत्तर भारतीय" : "North Indian"}
        </button>
        <button
          aria-pressed={style === "south"}
          onClick={() => onStyle("south")}
        >
          {hi ? "दक्षिण भारतीय" : "South Indian"}
        </button>
      </div>
      {style === "north" ? (
        <svg
          className={s.chart}
          viewBox="0 0 500 500"
          role="img"
          aria-label={`${chart.varga} ${hi ? "उत्तर भारतीय कुंडली; नीचे पूर्ण तालिका" : "North Indian chart; full placements in the table below"}`}
        >
          <rect
            x="2"
            y="2"
            width="496"
            height="496"
            rx="4"
            fill="#211914"
            stroke="#b89262"
            strokeWidth="2"
          />
          <path
            d="M2 2L498 498M498 2L2 498M250 2L498 250L250 498L2 250Z"
            fill="none"
            stroke="#b89262"
            strokeWidth="1.5"
          />
          {northLabels(chart, hi).map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              fill={label.sign ? "#e8be7b" : "#faf3e5"}
              fontSize={label.sign ? 16 : 15}
            >
              {label.label}
            </text>
          ))}
        </svg>
      ) : (
        <div
          className={s.south}
          role="img"
          aria-label={`${chart.varga} ${hi ? "दक्षिण भारतीय कुंडली" : "South Indian chart"}`}
        >
          {grid.map((sign, i) =>
            sign ? (
              <div key={i}>
                <strong>
                  {hi ? signHi[sign - 1] : ZODIAC_SIGNS[sign - 1].name}
                  {sign === chart.ascendantSign ? " ↑" : ""}
                </strong>
                <span>
                  {chart.rashiHouses[sign]
                    .map((id) => (hi ? planetHi[id] : id))
                    .join(" · ") || "—"}
                </span>
              </div>
            ) : (
              <div key={i} className={s.empty}>
                {i === 5 ? chart.varga : ""}
              </div>
            ),
          )}
        </div>
      )}
      <p className={s.muted}>
        {hi
          ? "↑ / Asc = लग्न। उत्तर भारतीय चित्र में भाव स्थिर हैं; संख्या राशि दर्शाती है।"
          : "↑ / Asc = ascendant. North Indian houses stay fixed; numbers identify signs."}
      </p>
    </>
  );
}
