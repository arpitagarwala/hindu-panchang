'use client';

import React, { useState } from 'react';
import { ChartCalculationResult, PlanetaryPosition } from '@/lib/astronomy/ephemeris';
import { PLANETS, ZODIAC_SIGNS } from '@/lib/astronomy/constants';

interface SouthIndianChartProps {
  chart: ChartCalculationResult;
  selectedHouse?: number | null;
  onSelectHouse?: (houseNumber: number) => void;
  onSelectPlanet?: (planetId: string) => void;
  title?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

const SIGN_GRID_POSITIONS: Record<number, { col: number; row: number }> = {
  12: { col: 0, row: 0 },
  1: { col: 1, row: 0 },
  2: { col: 2, row: 0 },
  3: { col: 3, row: 0 },
  4: { col: 3, row: 1 },
  5: { col: 3, row: 2 },
  6: { col: 3, row: 3 },
  7: { col: 2, row: 3 },
  8: { col: 1, row: 3 },
  9: { col: 0, row: 3 },
  10: { col: 0, row: 2 },
  11: { col: 0, row: 1 },
};

export default function SouthIndianChart({
  chart,
  selectedHouse,
  onSelectHouse,
  onSelectPlanet,
  title,
  className = '',
  variant = 'compact',
}: SouthIndianChartProps) {
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const ascSign = chart?.ascendant?.sign || 1;

  // Group planets by Sign (1-12)
  const planetsBySign: Record<number, PlanetaryPosition[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsBySign[i] = [];
  }
  if (chart?.planets) {
    Object.values(chart.planets).forEach((p) => {
      if (planetsBySign[p.sign]) {
        planetsBySign[p.sign].push(p);
      }
    });
  }

  const cellSize = 125;
  const totalSize = cellSize * 4; // 500x500

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {title && (
        <div className="text-center mb-2">
          <h4 className="text-sm font-semibold tracking-wider text-amber-300/90 uppercase">{title}</h4>
          <p className="text-xs text-stone-400">
            Lagna: <span className="text-amber-400 font-medium">{chart.ascendant.signName}</span>
          </p>
        </div>
      )}

      <svg
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        className="w-full max-w-[500px] h-auto drop-shadow-2xl"
      >
        <rect x="0" y="0" width={totalSize} height={totalSize} fill="#14100e" rx="16" stroke="#543b2b" strokeWidth="3" />

        {/* Center Box (2x2) */}
        <rect
          x={cellSize}
          y={cellSize}
          width={cellSize * 2}
          height={cellSize * 2}
          fill="#1c1613"
          stroke="#543b2b"
          strokeWidth="2"
        />
        <text
          x={totalSize / 2}
          y={totalSize / 2 - 12}
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="16"
          fontWeight="bold"
          fontFamily="'Noto Serif Devanagari', serif, sans-serif"
        >
          {title || 'RASHI (D1)'}
        </text>
        <text
          x={totalSize / 2}
          y={totalSize / 2 + 14}
          textAnchor="middle"
          fill="#a8a29e"
          fontSize="12"
        >
          Asc: {chart.ascendant.signName} {chart.ascendant.dms}
        </text>

        {/* 12 Sign Cells */}
        {Object.entries(SIGN_GRID_POSITIONS).map(([signStr, pos]) => {
          const signNum = Number(signStr);
          const signDef = ZODIAC_SIGNS[signNum - 1];
          const isAsc = signNum === ascSign;
          const houseNum = ((signNum - ascSign + 12) % 12) + 1;
          const isSelected = selectedHouse === houseNum;
          const isHovered = hoveredSign === signNum;
          const planetsInSign = planetsBySign[signNum] || [];

          const x = pos.col * cellSize;
          const y = pos.row * cellSize;

          return (
            <g
              key={signNum}
              className="cursor-pointer transition-all"
              onClick={() => onSelectHouse?.(houseNum)}
              onMouseEnter={() => setHoveredSign(signNum)}
              onMouseLeave={() => setHoveredSign(null)}
            >
              {/* Cell Background */}
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={isSelected ? 'rgba(245, 158, 11, 0.28)' : isHovered ? 'rgba(245, 158, 11, 0.12)' : '#181210'}
                stroke={isHovered ? '#f59e0b' : '#573f32'}
                strokeWidth={isHovered ? '2.5' : '1.25'}
              />

              {/* Ascendant Marker Line & Badge */}
              {isAsc && (
                <>
                  <line x1={x} y1={y} x2={x + 35} y2={y + 35} stroke="#ef4444" strokeWidth="3" />
                  <text x={x + 10} y={y + 16} fill="#ef4444" fontSize="11" fontWeight="900">
                    ASC
                  </text>
                </>
              )}

              {/* Sign & House Info */}
              <text x={x + cellSize - 8} y={y + 18} textAnchor="end" fill="#f59e0b" fontSize="12" fontWeight="800">
                {signDef.sanskrit} (H{houseNum})
              </text>

              {/* Planets in this sign */}
              <g transform={`translate(${x + cellSize / 2}, ${y + cellSize / 2 + 10})`}>
                {planetsInSign.map((planet, pIdx) => {
                  const total = planetsInSign.length;
                  let offsetX = 0;
                  let offsetY = 0;

                  if (variant === 'compact') {
                    if (total === 1) {
                      offsetY = 0;
                    } else if (total === 2) {
                      offsetY = pIdx === 0 ? -14 : 14;
                    } else if (total === 3) {
                      offsetY = pIdx === 0 ? -26 : pIdx === 1 ? 0 : 26;
                    } else {
                      const row = Math.floor(pIdx / 2);
                      const col = pIdx % 2;
                      offsetX = col === 0 ? -22 : 22;
                      offsetY = (row - 1) * 18;
                    }
                  } else {
                    if (total === 1) {
                      offsetY = 0;
                    } else if (total === 2) {
                      offsetY = pIdx === 0 ? -16 : 16;
                    } else if (total === 3) {
                      offsetY = pIdx === 0 ? -28 : pIdx === 1 ? 0 : 28;
                    } else {
                      const row = Math.floor(pIdx / 2);
                      const col = pIdx % 2;
                      offsetX = col === 0 ? -28 : 28;
                      offsetY = (row - 1) * 22;
                    }
                  }

                  const pDef = PLANETS[planet.id];
                  const isDignified = planet.dignity === 'Exalted' || planet.dignity === 'Own Sign';
                  const isDebilitated = planet.dignity === 'Debilitated';
                  const badgeColor = isDignified ? '#10b981' : isDebilitated ? '#ef4444' : pDef?.color || '#f59e0b';
                  const isPlanetHovered = hoveredPlanet === planet.id;
                  const glyph = planet.glyph || planet.name.slice(0, 2);

                  return (
                    <g
                      key={planet.id}
                      transform={`translate(${offsetX}, ${offsetY})`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlanet?.(planet.id);
                      }}
                      onMouseEnter={() => setHoveredPlanet(planet.id)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                    >
                      {variant === 'compact' ? (
                        <>
                          <rect
                            x="-19"
                            y="-11"
                            width="38"
                            height="22"
                            rx="6"
                            fill={isPlanetHovered ? '#382a22' : '#201612'}
                            stroke={isPlanetHovered ? '#f59e0b' : badgeColor}
                            strokeWidth={isPlanetHovered ? '2' : '1.5'}
                          />
                          <text
                            x="0"
                            y="1"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={badgeColor}
                            fontSize="13"
                            fontWeight="900"
                          >
                            {glyph}
                          </text>
                          {planet.isRetrograde && (
                            <circle cx="12" cy="-6" r="3" fill="#f87171" stroke="#201612" strokeWidth="1" />
                          )}
                        </>
                      ) : (
                        <>
                          <rect
                            x="-28"
                            y="-12"
                            width="56"
                            height="24"
                            rx="6"
                            fill={isPlanetHovered ? '#382a22' : '#201612'}
                            stroke={isPlanetHovered ? '#f59e0b' : badgeColor}
                            strokeWidth={isPlanetHovered ? '2' : '1.5'}
                          />
                          <text
                            x="-12"
                            y="1"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={badgeColor}
                            fontSize="13"
                            fontWeight="900"
                          >
                            {glyph}
                          </text>
                          <text
                            x="13"
                            y="1"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#e7e5e4"
                            fontSize="11"
                            fontWeight="700"
                          >
                            {planet.isRetrograde ? '℞' : `${Math.floor(planet.degreeInSign)}°`}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
