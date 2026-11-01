'use client';

import React, { useState } from 'react';
import { ChartCalculationResult, PlanetaryPosition } from '@/lib/astronomy/ephemeris';
import { PLANETS, ZODIAC_SIGNS } from '@/lib/astronomy/constants';

interface NorthIndianChartProps {
  chart: ChartCalculationResult;
  selectedHouse?: number | null;
  onSelectHouse?: (houseNumber: number) => void;
  onSelectPlanet?: (planetId: string) => void;
  title?: string;
  className?: string;
  theme?: 'dark' | 'light' | 'vedic';
  variant?: 'compact' | 'full';
}

// Center coordinates for each of the 12 houses in a 500x500 SVG
// Optimized to give maximum breathing room away from the outer edges and Rashi numbers
const HOUSE_CENTERS: Record<number, { x: number; y: number; signPos: { x: number; y: number } }> = {
  1: { x: 250, y: 125, signPos: { x: 250, y: 200 } }, // Top Central Diamond
  2: { x: 125, y: 62.5, signPos: { x: 185, y: 30 } }, // Top-Left Triangle
  3: { x: 62.5, y: 125, signPos: { x: 30, y: 185 } }, // Left-Top Triangle
  4: { x: 125, y: 250, signPos: { x: 200, y: 250 } }, // Left Central Diamond
  5: { x: 62.5, y: 375, signPos: { x: 30, y: 315 } }, // Left-Bottom Triangle
  6: { x: 125, y: 437.5, signPos: { x: 185, y: 470 } }, // Bottom-Left Triangle
  7: { x: 250, y: 375, signPos: { x: 250, y: 300 } }, // Bottom Central Diamond
  8: { x: 375, y: 437.5, signPos: { x: 315, y: 470 } }, // Bottom-Right Triangle
  9: { x: 437.5, y: 375, signPos: { x: 470, y: 315 } }, // Right-Bottom Triangle
  10: { x: 375, y: 250, signPos: { x: 300, y: 250 } }, // Right Central Diamond
  11: { x: 437.5, y: 125, signPos: { x: 470, y: 185 } }, // Right-Top Triangle
  12: { x: 375, y: 62.5, signPos: { x: 315, y: 30 } }, // Top-Right Triangle
};

export default function NorthIndianChart({
  chart,
  selectedHouse,
  onSelectHouse,
  onSelectPlanet,
  title,
  className = '',
  theme = 'vedic',
  variant = 'compact',
}: NorthIndianChartProps) {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const ascSign = chart?.ascendant?.sign || 1;

  // Group planets by house (1-12)
  const planetsByHouse: Record<number, PlanetaryPosition[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }

  if (chart?.planets) {
    Object.values(chart.planets).forEach((p) => {
      if (planetsByHouse[p.house]) {
        planetsByHouse[p.house].push(p);
      }
    });
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {title && (
        <div className="text-center mb-2">
          <h4 className="text-sm font-semibold tracking-wider text-amber-300/90 uppercase">{title}</h4>
          <p className="text-xs text-stone-400">
            Lagna: <span className="text-amber-400 font-medium">{chart.ascendant.signName} ({chart.ascendant.dms})</span>
          </p>
        </div>
      )}

      <svg
        viewBox="0 0 500 500"
        className="w-full max-w-[500px] h-auto drop-shadow-2xl transition-all duration-300"
        style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.6))' }}
      >
        <defs>
          {/* Background Gradients */}
          <linearGradient id="chartBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1713" />
            <stop offset="50%" stopColor="#16110e" />
            <stop offset="100%" stopColor="#0d0a08" />
          </linearGradient>

          <linearGradient id="kendraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.16)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.06)" />
          </linearGradient>

          <linearGradient id="activeHouseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.35)" />
            <stop offset="100%" stopColor="rgba(234, 88, 12, 0.2)" />
          </linearGradient>
        </defs>

        {/* Chart Background Base */}
        <rect x="0" y="0" width="500" height="500" fill="url(#chartBgGrad)" rx="16" stroke="#543b2b" strokeWidth="3" />

        {/* 12 House Polygons */}
        {/* House 1: Top Center Diamond */}
        <polygon
          points="250,0 375,125 250,250 125,125"
          fill={selectedHouse === 1 ? 'url(#activeHouseGrad)' : 'url(#kendraGrad)'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 1 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 1 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(1)}
          onMouseEnter={() => setHoveredHouse(1)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 2: Top-Left Triangle */}
        <polygon
          points="0,0 250,0 125,125"
          fill={selectedHouse === 2 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 2 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 2 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(2)}
          onMouseEnter={() => setHoveredHouse(2)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 3: Left-Top Triangle */}
        <polygon
          points="0,0 125,125 0,250"
          fill={selectedHouse === 3 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 3 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 3 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(3)}
          onMouseEnter={() => setHoveredHouse(3)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 4: Left Center Diamond */}
        <polygon
          points="0,250 125,125 250,250 125,375"
          fill={selectedHouse === 4 ? 'url(#activeHouseGrad)' : 'url(#kendraGrad)'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 4 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 4 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(4)}
          onMouseEnter={() => setHoveredHouse(4)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 5: Left-Bottom Triangle */}
        <polygon
          points="0,250 125,375 0,500"
          fill={selectedHouse === 5 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 5 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 5 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(5)}
          onMouseEnter={() => setHoveredHouse(5)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 6: Bottom-Left Triangle */}
        <polygon
          points="0,500 125,375 250,500"
          fill={selectedHouse === 6 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 6 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 6 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(6)}
          onMouseEnter={() => setHoveredHouse(6)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 7: Bottom Center Diamond */}
        <polygon
          points="250,250 375,375 250,500 125,375"
          fill={selectedHouse === 7 ? 'url(#activeHouseGrad)' : 'url(#kendraGrad)'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 7 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 7 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(7)}
          onMouseEnter={() => setHoveredHouse(7)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 8: Bottom-Right Triangle */}
        <polygon
          points="250,500 375,375 500,500"
          fill={selectedHouse === 8 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 8 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 8 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(8)}
          onMouseEnter={() => setHoveredHouse(8)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 9: Right-Bottom Triangle */}
        <polygon
          points="500,500 375,375 500,250"
          fill={selectedHouse === 9 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 9 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 9 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(9)}
          onMouseEnter={() => setHoveredHouse(9)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 10: Right Center Diamond */}
        <polygon
          points="500,250 375,375 250,250 375,125"
          fill={selectedHouse === 10 ? 'url(#activeHouseGrad)' : 'url(#kendraGrad)'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 10 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 10 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(10)}
          onMouseEnter={() => setHoveredHouse(10)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 11: Right-Top Triangle */}
        <polygon
          points="500,250 375,125 500,0"
          fill={selectedHouse === 11 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 11 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 11 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(11)}
          onMouseEnter={() => setHoveredHouse(11)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* House 12: Top-Right Triangle */}
        <polygon
          points="500,0 375,125 250,0"
          fill={selectedHouse === 12 ? 'url(#activeHouseGrad)' : 'transparent'}
          className="cursor-pointer transition-colors duration-200"
          stroke={hoveredHouse === 12 ? '#f59e0b' : '#785641'}
          strokeWidth={hoveredHouse === 12 ? '3' : '1.75'}
          onClick={() => onSelectHouse?.(12)}
          onMouseEnter={() => setHoveredHouse(12)}
          onMouseLeave={() => setHoveredHouse(null)}
        />

        {/* Classical Chart Frame Diagonal & Diamond Lines */}
        <line x1="0" y1="0" x2="500" y2="500" stroke="#9a7359" strokeWidth="2" />
        <line x1="500" y1="0" x2="0" y2="500" stroke="#9a7359" strokeWidth="2" />
        <polygon points="250,0 500,250 250,500 0,250" fill="none" stroke="#d97706" strokeWidth="2.75" opacity="0.9" />

        {/* Render Rashi Numbers & Stacked Planets in each House */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const signNum = ((ascSign - 1 + (h - 1)) % 12) + 1;
          const houseCenter = HOUSE_CENTERS[h];
          const planetsInHouse = planetsByHouse[h] || [];

          return (
            <g key={h} className="pointer-events-none">
              {/* Rashi Sign Number (Crisp, High-Contrast) */}
              <text
                x={houseCenter.signPos.x}
                y={houseCenter.signPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f59e0b"
                fontSize="15"
                fontWeight="900"
                fontFamily="'Noto Serif Devanagari', serif, sans-serif"
                opacity="0.95"
              >
                {signNum}
              </text>

              {/* Planets Cluster Layout with Prominent High-Legibility Badges */}
              <g transform={`translate(${houseCenter.x}, ${houseCenter.y})`}>
                {planetsInHouse.map((planet, idx) => {
                  const total = planetsInHouse.length;
                  let offsetX = 0;
                  let offsetY = 0;

                  // Vertical layout math depending on count & variant
                  if (variant === 'compact') {
                    if (total === 1) {
                      offsetY = 0;
                    } else if (total === 2) {
                      offsetY = idx === 0 ? -15 : 15;
                    } else if (total === 3) {
                      offsetY = idx === 0 ? -28 : idx === 1 ? 0 : 28;
                    } else if (total === 4) {
                      const row = Math.floor(idx / 2);
                      const col = idx % 2;
                      offsetX = col === 0 ? -22 : 22;
                      offsetY = row === 0 ? -15 : 15;
                    } else {
                      const row = Math.floor(idx / 2);
                      const col = idx % 2;
                      offsetX = col === 0 ? -22 : 22;
                      offsetY = (row - 1) * 20;
                    }
                  } else {
                    if (total === 1) {
                      offsetY = 0;
                    } else if (total === 2) {
                      offsetY = idx === 0 ? -18 : 18;
                    } else if (total === 3) {
                      offsetY = idx === 0 ? -32 : idx === 1 ? 0 : 32;
                    } else {
                      const row = Math.floor(idx / 2);
                      const col = idx % 2;
                      offsetX = col === 0 ? -30 : 30;
                      offsetY = (row - 1) * 24;
                    }
                  }

                  const pDef = PLANETS[planet.id];
                  const isDignified = planet.dignity === 'Exalted' || planet.dignity === 'Own Sign';
                  const isDebilitated = planet.dignity === 'Debilitated';
                  const badgeColor = isDignified ? '#10b981' : isDebilitated ? '#ef4444' : pDef?.color || '#f59e0b';
                  const isHovered = hoveredPlanet === planet.id;

                  // Planet glyph abbreviation (e.g. Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke)
                  const glyph = planet.glyph || planet.name.slice(0, 2);

                  return (
                    <g
                      key={planet.id}
                      transform={`translate(${offsetX}, ${offsetY})`}
                      className="pointer-events-auto cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlanet?.(planet.id);
                      }}
                      onMouseEnter={() => setHoveredPlanet(planet.id)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                    >
                      {/* Compact Mode: Large, Ultra-Legible Graha Pill */}
                      {variant === 'compact' ? (
                        <>
                          <rect
                            x="-19"
                            y="-12"
                            width="38"
                            height="24"
                            rx="6"
                            fill={isHovered ? '#382a22' : '#221914'}
                            stroke={isHovered ? '#f59e0b' : badgeColor}
                            strokeWidth={isHovered ? '2' : '1.5'}
                            className="transition-all duration-150"
                          />
                          <text
                            x="0"
                            y="1"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={badgeColor}
                            fontSize="13"
                            fontWeight="900"
                            letterSpacing="0.5px"
                          >
                            {glyph}
                          </text>

                          {/* Retrograde dot indicator */}
                          {planet.isRetrograde && (
                            <circle cx="12" cy="-7" r="3.5" fill="#f87171" stroke="#221914" strokeWidth="1" />
                          )}
                        </>
                      ) : (
                        /* Full Mode: Rich badge with Glyph + Exact Degrees + Retrograde indicator */
                        <>
                          <rect
                            x="-28"
                            y="-13"
                            width="56"
                            height="26"
                            rx="6"
                            fill={isHovered ? '#382a22' : '#221914'}
                            stroke={isHovered ? '#f59e0b' : badgeColor}
                            strokeWidth={isHovered ? '2' : '1.5'}
                            className="transition-all duration-150"
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
