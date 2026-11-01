'use client';

import React, { useState, useEffect } from 'react';
import { ChartCalculationResult, PlanetaryPosition } from '@/lib/astronomy/ephemeris';
import { calculateVargaChart, VargaType, VARGA_INFO } from '@/lib/astronomy/vargas';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';
import { PLANETS, ZODIAC_SIGNS, NAKSHATRAS } from '@/lib/astronomy/constants';
import { X, Sparkles, Compass, Shield, Award, Info, Maximize2, Layers, Table } from 'lucide-react';

interface KundaliViewerProps {
  chart: ChartCalculationResult;
  language?: 'en' | 'hi' | 'hinglish';
  showControls?: boolean;
  variant?: 'compact' | 'full';
}

const HOUSE_SIGNIFICATIONS: Record<number, { en: string; hi: string; hinglish: string }> = {
  1: { en: 'Self, Body, Vitality, Personality, General Wellbeing', hi: 'तनु भाव — शरीर, स्वास्थ्य, स्वभाव, आत्मबल व प्रतिष्ठा', hinglish: 'Self personality, health, physical constitution aur life direction.' },
  2: { en: 'Wealth, Family, Speech, Assets, Food & Lineage', hi: 'धन भाव — संचित धन, कुटुंब, वाणी, संस्कार व नेत्र', hinglish: 'Liquid savings, family lineage, speech style aur primary values.' },
  3: { en: 'Courage, Siblings, Communication, Short Journeys, Initiatives', hi: 'सहज भाव — पराक्रम, अनुज, संचार कौशल, छोटी यात्राएं व उद्यम', hinglish: 'Courage, younger siblings, self-effort aur communication skills.' },
  4: { en: 'Mother, Home, Land, Vehicles, Emotional Peace, Heart', hi: 'सुख भाव — माता, गृह, भूमि, वाहन, अंतःकरण की शांति व संपत्ति', hinglish: 'Mother, inner emotional stability, property, vehicles aur domestic peace.' },
  5: { en: 'Intellect, Children, Creativity, Past Merits (Purva Punya), Romance', hi: 'सुत भाव — संतान, प्रज्ञा, पूर्व पुण्य, मंत्र सिद्धि व रचनात्मकता', hinglish: 'Higher intellect, children, creative genius, speculative gains aur romance.' },
  6: { en: 'Health, Overcoming Obstacles, Debts, Service, Competitions', hi: 'रिपु भाव — रोग, ऋण, शत्रु पर विजय, सेवा भावना व प्रतियोगिता', hinglish: 'Daily work routine, handling debts/enemies aur overcoming health challenges.' },
  7: { en: 'Marriage, Spouse, Partnerships, Public Relations, Business', hi: 'जाया भाव — दांपत्य सुख, जीवनसाथी, व्यापारिक साझेदार व जनसंपर्क', hinglish: 'Spouse, marriage quality, business partnerships aur public dealing.' },
  8: { en: 'Longevity, Transformation, Hidden Knowledge, Occult, Sudden Changes', hi: 'आयु भाव — आयु, गूढ़ रहस्य, परिवर्तन, पैतृक संपत्ति व अनुसंधान', hinglish: 'Longevity, sudden windfalls, research, deep occult interest aur transformations.' },
  9: { en: 'Dharma, Higher Wisdom, Guru, Father, Fortune, Long Pilgrimages', hi: 'भाग्य भाव — धर्म, भाग्य, गुरु, पिता, उच्च ज्ञान व तीर्थ यात्रा', hinglish: 'Fortune, higher learning, Guru guidance, spiritual values aur luck.' },
  10: { en: 'Career, Fame, Public Status, Authority, Father/Karma', hi: 'कर्म भाव — आजीविका, पद-प्रतिष्ठा, राज्य कृपा, नेतृत्व व यश', hinglish: 'Professional career, public authority, fame aur social achievement.' },
  11: { en: 'Gains, Aspirations, Elder Siblings, Large Networks, Ambitions', hi: 'आय भाव — समस्त लाभ, ज्येष्ठ भ्राता, मित्र समूह, आर्थिक सफलता', hinglish: 'Financial gains, fulfilling desires, networking circles aur cash flow.' },
  12: { en: 'Liberation (Moksha), Foreign Travel, Expenses, Meditation, Sleep', hi: 'व्यय भाव — मोक्ष, विदेश वास, व्यय, शयन सुख, एकांत व आध्यात्म', hinglish: 'Spiritual liberation (Moksha), foreign travels, meditation aur subconscious mind.' },
};

export default function KundaliViewer({
  chart,
  language = 'en',
  showControls = true,
  variant = 'full',
}: KundaliViewerProps) {
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [selectedVarga, setSelectedVarga] = useState<VargaType>('D1');
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsZoomModalOpen(false);
    }
    if (isZoomModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomModalOpen]);

  // Compute active Varga chart if not D1
  const isD1 = selectedVarga === 'D1';
  let activeChartData = chart;

  if (!isD1) {
    const vargaRes = calculateVargaChart(
      selectedVarga,
      chart.ascendant.siderealLon,
      Object.fromEntries(
        Object.entries(chart.planets).map(([k, v]) => [k, { siderealLon: v.siderealLon, name: v.name }])
      )
    );

    const vargaPlanets: Record<string, PlanetaryPosition> = {};
    for (const [pKey, pData] of Object.entries(chart.planets)) {
      const vPlace = vargaRes.placements[pKey];
      const signNum = vPlace ? vPlace.sign : pData.sign;
      const signDef = ZODIAC_SIGNS[signNum - 1] || ZODIAC_SIGNS[0];
      vargaPlanets[pKey] = {
        ...pData,
        sign: signNum,
        signName: signDef.name,
        signSanskrit: signDef.sanskrit,
        signLord: signDef.lord,
        house: vPlace ? vPlace.house : pData.house,
      };
    }

    const ascDef = ZODIAC_SIGNS[vargaRes.ascendantSign - 1] || ZODIAC_SIGNS[0];
    activeChartData = {
      ...chart,
      ascendant: {
        ...chart.ascendant,
        sign: vargaRes.ascendantSign,
        signName: ascDef.name,
        signSanskrit: ascDef.sanskrit,
        signLord: ascDef.lord,
      },
      planets: vargaPlanets,
    };
  }

  const inspectedPlanet = selectedPlanet ? activeChartData.planets[selectedPlanet] : null;
  const inspectedHouseData = selectedHouse ? activeChartData.houses[selectedHouse - 1] : null;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Controls Bar */}
      {showControls && (
        <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-3 mb-2 px-2">
          {/* Chart Style Switcher */}
          <div className="flex bg-stone-900/80 p-1 rounded-xl border border-stone-800 backdrop-blur-md">
            <button
              onClick={() => setChartStyle('north')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartStyle === 'north' ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              North Indian (Diamond)
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartStyle === 'south' ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              South Indian (Square)
            </button>
          </div>

          {/* Varga Divisional Chart Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Varga:</span>
            <select
              value={selectedVarga}
              onChange={(e) => setSelectedVarga(e.target.value as VargaType)}
              aria-label="Select Divisional Chart (Varga)"
              className="bg-stone-900 border border-stone-700 text-amber-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="D1">D1 — Rashi (Main Life Chart)</option>
              <option value="D9">D9 — Navamsha (Spouse / Dharma)</option>
              <option value="D10">D10 — Dashamsha (Career & Status)</option>
              <option value="D2">D2 — Hora (Wealth & Assets)</option>
              <option value="D3">D3 — Drekkana (Courage & Siblings)</option>
              <option value="D7">D7 — Saptamsha (Children / Progeny)</option>
              <option value="D12">D12 — Dwadashamsha (Lineage / Parents)</option>
              <option value="D24">D24 — Chaturvimshamsha (Learning)</option>
              <option value="D30">D30 — Trimshamsha (Misfortunes)</option>
              <option value="D60">D60 — Shashtiamsha (Past Karma)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main SVG Chart Container with Zoom Trigger */}
      <div className="relative w-full flex justify-center group">
        {chartStyle === 'north' ? (
          <NorthIndianChart
            chart={activeChartData}
            selectedHouse={selectedHouse}
            onSelectHouse={(h) => setSelectedHouse(h === selectedHouse ? null : h)}
            onSelectPlanet={(pId) => setSelectedPlanet(pId)}
            title={VARGA_INFO[selectedVarga]?.name ? `${VARGA_INFO[selectedVarga].name} (${selectedVarga})` : 'Rashi Chart'}
            variant={variant}
          />
        ) : (
          <SouthIndianChart
            chart={activeChartData}
            selectedHouse={selectedHouse}
            onSelectHouse={(h) => setSelectedHouse(h === selectedHouse ? null : h)}
            onSelectPlanet={(pId) => setSelectedPlanet(pId)}
            title={VARGA_INFO[selectedVarga]?.name ? `${VARGA_INFO[selectedVarga].name} (${selectedVarga})` : 'Rashi Chart'}
            variant={variant}
          />
        )}

        {/* Quick Pop-out / Zoom Button Overlay */}
        <button
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-amber-300 border border-stone-800/90 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold group/btn"
          title="Expand Chart in High-Resolution Popup"
          aria-label="Expand Chart"
        >
          <Maximize2 className="w-4 h-4 text-amber-400 group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline">Expand</span>
        </button>
      </div>

      {/* Interactive Detail Drawer / Inspection Panel */}
      {(inspectedPlanet || inspectedHouseData) && (
        <div className="w-full max-w-xl mt-4 p-4 rounded-2xl bg-stone-900/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex justify-between items-start mb-3 border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-base font-bold text-amber-300">
                {inspectedPlanet
                  ? `${inspectedPlanet.name} (${inspectedPlanet.sanskrit})`
                  : `House ${inspectedHouseData?.house} — ${inspectedHouseData?.signName} Rashi`}
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedPlanet(null);
                setSelectedHouse(null);
              }}
              aria-label="Close Details"
              className="text-stone-400 hover:text-stone-100 p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Planet Details */}
          {inspectedPlanet && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Position</span>
                <span className="font-semibold text-stone-100">
                  {inspectedPlanet.signName} ({inspectedPlanet.signSanskrit}) • {inspectedPlanet.dms}
                </span>
              </div>
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Dignity</span>
                <span
                  className={`font-bold ${
                    inspectedPlanet.dignity === 'Exalted' || inspectedPlanet.dignity === 'Own Sign'
                      ? 'text-emerald-400'
                      : inspectedPlanet.dignity === 'Debilitated'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {inspectedPlanet.dignity}
                </span>
              </div>
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Placed House</span>
                <span className="font-semibold text-stone-100">House {inspectedPlanet.house}</span>
              </div>
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Nakshatra</span>
                <span className="font-semibold text-stone-100">
                  {inspectedPlanet.nakshatraName} (Pada {inspectedPlanet.pada})
                </span>
              </div>
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Nakshatra Lord</span>
                <span className="font-semibold text-amber-300">{inspectedPlanet.nakshatraLord}</span>
              </div>
              <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">State</span>
                <span className="font-semibold text-stone-200">
                  {inspectedPlanet.isRetrograde ? 'Retrograde (Vakri)' : 'Direct (Marga)'}
                  {inspectedPlanet.isCombust ? ' • Combust' : ''}
                </span>
              </div>
            </div>
          )}

          {/* House Details */}
          {inspectedHouseData && !inspectedPlanet && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-300">Sign Lord: <strong className="text-amber-400">{inspectedHouseData.signLord}</strong></span>
                <span className="text-stone-300">Planets Present: <strong className="text-stone-100">{inspectedHouseData.planets.join(', ') || 'None'}</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-stone-300">
                <p className="font-medium text-amber-300/90 mb-1">Significations (कारकतत्व):</p>
                <p>{HOUSE_SIGNIFICATIONS[inspectedHouseData.house]?.[language] || HOUSE_SIGNIFICATIONS[inspectedHouseData.house]?.en}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          FULL PLANETARY POSITIONS DATA TABLE (FOR EVERY CHART VIEW)
      ────────────────────────────────────────────────────────── */}
      {variant === 'full' && (
        <div className="w-full max-w-4xl space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                {VARGA_INFO[selectedVarga]?.name} ({selectedVarga}) Planetary Positions & Cusps
              </h4>
            </div>
            <span className="text-xs text-stone-400">
              Lagna: <strong className="text-amber-400">{activeChartData.ascendant.signName} ({activeChartData.ascendant.signSanskrit})</strong> • {activeChartData.ascendant.dms}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/70 shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/90 text-stone-400 border-b border-stone-800 font-medium">
                <tr>
                  <th className="py-3 px-3.5">Planet</th>
                  <th className="py-3 px-3.5">Sign (Rashi)</th>
                  <th className="py-3 px-3.5">Degree (DMS)</th>
                  <th className="py-3 px-3.5">House</th>
                  <th className="py-3 px-3.5">Nakshatra & Pada</th>
                  <th className="py-3 px-3.5">Dignity</th>
                  <th className="py-3 px-3.5">Motion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {/* Ascendant Row */}
                <tr className="bg-amber-950/20 font-medium text-amber-200">
                  <td className="py-2.5 px-3.5 font-bold flex items-center gap-1.5 text-amber-400">
                    <span>ASC</span>
                    <span>Ascendant (Lagna)</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-stone-200">{activeChartData.ascendant.signName} ({activeChartData.ascendant.signSanskrit})</td>
                  <td className="py-2.5 px-3.5 font-mono text-amber-300">{activeChartData.ascendant.dms}</td>
                  <td className="py-2.5 px-3.5 font-bold text-stone-100">House 1</td>
                  <td className="py-2.5 px-3.5 text-stone-300">{activeChartData.ascendant.nakshatraName} (Pada {activeChartData.ascendant.pada})</td>
                  <td className="py-2.5 px-3.5 text-stone-400">Lord: {activeChartData.ascendant.signLord}</td>
                  <td className="py-2.5 px-3.5 text-stone-400">Lagna Cusp</td>
                </tr>

                {/* 9 Core Vedic Planets */}
                {Object.values(activeChartData.planets).map((p) => {
                  const isDignified = p.dignity === 'Exalted' || p.dignity === 'Own Sign';
                  const isDebilitated = p.dignity === 'Debilitated';
                  const pColor = PLANETS[p.id]?.color || '#f59e0b';
                  const isSelected = selectedPlanet === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-stone-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/15 border-l-2 border-amber-400' : ''
                      }`}
                      onClick={() => setSelectedPlanet(p.id === selectedPlanet ? null : p.id)}
                    >
                      <td className="py-2.5 px-3.5 font-bold flex items-center gap-1.5" style={{ color: pColor }}>
                        <span>{p.glyph}</span>
                        <span>{p.name}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-stone-200">
                        {p.signName} ({p.signSanskrit})
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-amber-300">{p.dms}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-stone-100">House {p.house}</td>
                      <td className="py-2.5 px-3.5 text-stone-300">{p.nakshatraName} (Pada {p.pada})</td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            isDignified
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isDebilitated
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {p.dignity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-stone-400">
                        {p.isRetrograde ? <span className="text-rose-400 font-bold">Vakri (℞)</span> : 'Marga'}
                        {p.isCombust && <span className="text-amber-400 ml-1">• Combust</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          HIGH-RESOLUTION FULLSCREEN / POPUP MODAL
      ────────────────────────────────────────────────────────── */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-stone-950 border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                    {VARGA_INFO[selectedVarga]?.name || 'Birth Chart'} ({selectedVarga})
                  </h3>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ascendant (Lagna): <span className="text-amber-400 font-semibold">{activeChartData.ascendant.signName} ({activeChartData.ascendant.signSanskrit}) • {activeChartData.ascendant.dms}</span> • Nakshatra: {activeChartData.ascendant.nakshatraName} (Pada {activeChartData.ascendant.pada})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomModalOpen(false)}
                  className="p-2.5 rounded-xl bg-stone-900 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors border border-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Interactive Controls (Vargas & Style) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
              <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => setChartStyle('north')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartStyle === 'north' ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  North Indian (Diamond)
                </button>
                <button
                  onClick={() => setChartStyle('south')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartStyle === 'south' ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  South Indian (Square)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Divisional Chart:</span>
                <select
                  value={selectedVarga}
                  onChange={(e) => setSelectedVarga(e.target.value as VargaType)}
                  aria-label="Select Divisional Chart (Varga) in Modal"
                  className="bg-stone-950 border border-stone-700 text-amber-300 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  <option value="D1">D1 — Rashi (Lagna Chart)</option>
                  <option value="D9">D9 — Navamsha (Spouse & Dharma)</option>
                  <option value="D10">D10 — Dashamsha (Career & Status)</option>
                  <option value="D2">D2 — Hora (Wealth & Assets)</option>
                  <option value="D3">D3 — Drekkana (Courage & Siblings)</option>
                  <option value="D7">D7 — Saptamsha (Children)</option>
                  <option value="D12">D12 — Dwadashamsha (Lineage)</option>
                  <option value="D24">D24 — Chaturvimshamsha (Learning)</option>
                  <option value="D30">D30 — Trimshamsha (Misfortunes)</option>
                  <option value="D60">D60 — Shashtiamsha (Past Karma)</option>
                </select>
              </div>
            </div>

            {/* Expansive SVG Chart */}
            <div className="w-full flex justify-center py-2">
              <div className="w-full max-w-[540px]">
                {chartStyle === 'north' ? (
                  <NorthIndianChart
                    chart={activeChartData}
                    selectedHouse={selectedHouse}
                    onSelectHouse={(h) => setSelectedHouse(h === selectedHouse ? null : h)}
                    onSelectPlanet={(pId) => setSelectedPlanet(pId)}
                    variant="full"
                  />
                ) : (
                  <SouthIndianChart
                    chart={activeChartData}
                    selectedHouse={selectedHouse}
                    onSelectHouse={(h) => setSelectedHouse(h === selectedHouse ? null : h)}
                    onSelectPlanet={(pId) => setSelectedPlanet(pId)}
                    variant="full"
                  />
                )}
              </div>
            </div>

            {/* Planetary Positions Table inside Modal for Instant Reference */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                  Exact Planetary Positions & Dignities
                </h4>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">Planet</th>
                      <th className="py-2.5 px-3">Sign (Rashi)</th>
                      <th className="py-2.5 px-3">Degrees (DMS)</th>
                      <th className="py-2.5 px-3">House</th>
                      <th className="py-2.5 px-3">Nakshatra & Pada</th>
                      <th className="py-2.5 px-3">Dignity</th>
                      <th className="py-2.5 px-3">Motion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-200">
                    {/* Ascendant in Modal */}
                    <tr className="bg-amber-950/20 text-amber-300 font-medium">
                      <td className="py-2.5 px-3 font-bold">ASC (Lagna)</td>
                      <td className="py-2.5 px-3">{activeChartData.ascendant.signName} ({activeChartData.ascendant.signSanskrit})</td>
                      <td className="py-2.5 px-3 font-mono">{activeChartData.ascendant.dms}</td>
                      <td className="py-2.5 px-3 font-bold">House 1</td>
                      <td className="py-2.5 px-3">{activeChartData.ascendant.nakshatraName} (Pada {activeChartData.ascendant.pada})</td>
                      <td className="py-2.5 px-3">Lord: {activeChartData.ascendant.signLord}</td>
                      <td className="py-2.5 px-3">Cusp</td>
                    </tr>
                    {Object.values(activeChartData.planets).map((p) => {
                      const isDignified = p.dignity === 'Exalted' || p.dignity === 'Own Sign';
                      const isDebilitated = p.dignity === 'Debilitated';
                      const pColor = PLANETS[p.id]?.color || '#f59e0b';
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-stone-800/40 cursor-pointer transition-colors"
                          onClick={() => setSelectedPlanet(p.id)}
                        >
                          <td className="py-2.5 px-3 font-bold flex items-center gap-1.5" style={{ color: pColor }}>
                            <span>{p.glyph}</span>
                            <span>{p.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-300">{p.signName} ({p.signSanskrit})</td>
                          <td className="py-2.5 px-3 font-mono text-amber-300">{p.dms}</td>
                          <td className="py-2.5 px-3 font-semibold text-stone-100">House {p.house}</td>
                          <td className="py-2.5 px-3 text-stone-300">{p.nakshatraName} (Pada {p.pada})</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                isDignified
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isDebilitated
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {p.dignity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-400">
                            {p.isRetrograde ? <span className="text-rose-400 font-bold">Vakri (℞)</span> : 'Marga'}
                            {p.isCombust && <span className="text-amber-400 ml-1">• Combust</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
