'use client';

import React, { useState } from 'react';
import { ChartCalculationResult } from '@/lib/astronomy/ephemeris';
import { VimshottariResult } from '@/lib/astronomy/dasha';
import { calculateShadbala, ShadbalaResult } from '@/lib/astronomy/shadbala';
import { calculateAshtakavarga, AshtakavargaResult } from '@/lib/astronomy/ashtakavarga';
import { analyzeYogasAndDoshas, YogasAndDoshasReport } from '@/lib/astronomy/yogas';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { formatDateFormatted, formatMonthYear } from '@/lib/utils/format';
import KundaliViewer from '../Kundali/KundaliViewer';
import {
  FileText,
  Table,
  Layers,
  Award,
  Sparkles,
  ShieldAlert,
  Printer,
  ChevronRight,
  Download,
  Flame,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';

interface ProModeDashboardProps {
  chart: ChartCalculationResult;
  dasha: VimshottariResult;
  language: LanguageCode;
}

export default function ProModeDashboard({ chart, dasha, language }: ProModeDashboardProps) {
  const t = TRANSLATIONS[language];
  const shadbala: ShadbalaResult = calculateShadbala(chart);
  const ashtakavarga: AshtakavargaResult = calculateAshtakavarga(chart);
  const yogasReport: YogasAndDoshasReport = analyzeYogasAndDoshas(chart);

  const [activeSubTab, setActiveSubTab] = useState<'positions' | 'vargas' | 'shadbala' | 'ashtakavarga' | 'yogas' | 'dashaTree'>('positions');

  const printReport = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Pro Mode Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/20 border border-amber-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-mono text-[10px] font-bold uppercase tracking-wider">
              PRO ASTROLOGER CONSOLE
            </span>
            <span className="text-xs text-stone-400">Ayanamsa: {chart.ayanamsaType.toUpperCase()} ({chart.ayanamsaDms})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mt-1">
            Technical Kundali & Ephemeris Suite
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Lagna: {chart.ascendant.signName} ({chart.ascendant.dms}) • Nakshatra: {chart.ascendant.nakshatraName} (Pada {chart.ascendant.pada})
          </p>
        </div>

        <button
          onClick={printReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          {t.chart.exportPdf}
        </button>
      </div>

      {/* Pro Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        {[
          { id: 'positions', label: 'Planetary Positions & DMS', icon: Table },
          { id: 'vargas', label: 'Shodashavargas (D1-D60)', icon: Layers },
          { id: 'shadbala', label: '6-Fold Shadbala Strength', icon: Award },
          { id: 'ashtakavarga', label: 'Ashtakavarga (SAV & BAV)', icon: Sparkles },
          { id: 'yogas', label: 'Yogas, Doshas & Sade Sati', icon: ShieldAlert },
          { id: 'dashaTree', label: 'Vimshottari Dasha Tree', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PLANETARY POSITIONS TABLE ─── */}
      {activeSubTab === 'positions' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-stone-900/90 border border-stone-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-stone-800 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-stone-100">Exact Sidereal Positions</h3>
              <span className="text-xs text-stone-400 font-mono">Reference: JPL/VSOP87</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                  <tr>
                    <th className="px-4 py-3">Planet</th>
                    <th className="px-4 py-3">Sign (Rashi)</th>
                    <th className="px-4 py-3">Longitude DMS</th>
                    <th className="px-4 py-3">House</th>
                    <th className="px-4 py-3">Nakshatra & Pada</th>
                    <th className="px-4 py-3">Nakshatra Lord</th>
                    <th className="px-4 py-3">Speed (deg/day)</th>
                    <th className="px-4 py-3">Dignity</th>
                    <th className="px-4 py-3">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {/* Ascendant Row */}
                  <tr className="bg-amber-500/5 text-amber-200">
                    <td className="px-4 py-3 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Ascendant (Lagna)
                    </td>
                    <td className="px-4 py-3">{chart.ascendant.signName}</td>
                    <td className="px-4 py-3 font-mono">{chart.ascendant.dms}</td>
                    <td className="px-4 py-3">1st House</td>
                    <td className="px-4 py-3">{chart.ascendant.nakshatraName} (Pada {chart.ascendant.pada})</td>
                    <td className="px-4 py-3">{chart.ascendant.nakshatraLord}</td>
                    <td className="px-4 py-3 font-mono">--</td>
                    <td className="px-4 py-3 font-semibold text-amber-400">Lagna Point</td>
                    <td className="px-4 py-3">Fixed Reference</td>
                  </tr>

                  {/* 9 Planetary Rows */}
                  {Object.values(chart.planets).map((p) => {
                    const isExalted = p.dignity === 'Exalted' || p.dignity === 'Own Sign';
                    const isDebilitated = p.dignity === 'Debilitated';
                    return (
                      <tr key={p.id} className="hover:bg-stone-800/40 text-stone-200 transition-colors">
                        <td className="px-4 py-3 font-bold flex items-center gap-2">
                          <span className="font-mono text-amber-400">{p.glyph}</span>
                          {p.name} ({p.sanskrit})
                        </td>
                        <td className="px-4 py-3">{p.signName}</td>
                        <td className="px-4 py-3 font-mono">{p.dms}</td>
                        <td className="px-4 py-3 font-semibold text-amber-300">House {p.house}</td>
                        <td className="px-4 py-3">{p.nakshatraName} (Pada {p.pada})</td>
                        <td className="px-4 py-3 text-stone-300">{p.nakshatraLord}</td>
                        <td className="px-4 py-3 font-mono text-stone-400">{p.speed.toFixed(3)}°/d</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              isExalted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isDebilitated
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {p.dignity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.isRetrograde ? (
                            <span className="text-amber-400 font-bold">Vakri (R)</span>
                          ) : (
                            <span className="text-stone-400">Direct</span>
                          )}
                          {p.isCombust && <span className="ml-1 text-rose-400 font-bold">• Combust</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kundali Visualizer */}
          <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 shadow-xl">
            <KundaliViewer chart={chart} language={language} />
          </div>
        </div>
      )}

      {/* ─── TAB 2: SHODASHAVARGAS (D1-D60) ─── */}
      {activeSubTab === 'vargas' && (
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-100">Divisional Charts Gallery</h3>
              <p className="text-xs text-stone-400">Switch between standard BPHS Shodashavargas.</p>
            </div>
          </div>
          <KundaliViewer chart={chart} language={language} />
        </div>
      )}

      {/* ─── TAB 3: 6-FOLD SHADBALA STRENGTH ─── */}
      {activeSubTab === 'shadbala' && (
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="border-b border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-lg text-stone-100">6-Fold Shadbala Planetary Strengths</h3>
            <p className="text-xs text-stone-400">Sthana, Dig, Kala, Cheshta, Naisargika, and Drik Bala in Virupas and Rupas.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                <tr>
                  <th className="px-3 py-2.5">Planet</th>
                  <th className="px-3 py-2.5">Sthana</th>
                  <th className="px-3 py-2.5">Dig</th>
                  <th className="px-3 py-2.5">Kala</th>
                  <th className="px-3 py-2.5">Cheshta</th>
                  <th className="px-3 py-2.5">Naisargika</th>
                  <th className="px-3 py-2.5">Drik</th>
                  <th className="px-3 py-2.5">Total (Rupas)</th>
                  <th className="px-3 py-2.5">Required</th>
                  <th className="px-3 py-2.5">Ratio</th>
                  <th className="px-3 py-2.5">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium">
                {Object.entries(shadbala).map(([pKey, data]) => (
                  <tr key={pKey} className="hover:bg-stone-800/40 text-stone-200">
                    <td className="px-3 py-2.5 font-bold text-amber-300">{pKey}</td>
                    <td className="px-3 py-2.5 font-mono">{data.sthanaBala}</td>
                    <td className="px-3 py-2.5 font-mono">{data.digBala}</td>
                    <td className="px-3 py-2.5 font-mono">{data.kalaBala}</td>
                    <td className="px-3 py-2.5 font-mono">{data.cheshtaBala}</td>
                    <td className="px-3 py-2.5 font-mono">{data.naisargikaBala.toFixed(1)}</td>
                    <td className="px-3 py-2.5 font-mono">{data.drikBala}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-stone-100">{data.totalRupas}</td>
                    <td className="px-3 py-2.5 font-mono text-stone-400">{data.requiredRupas}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          data.isStrong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {data.percentageRatio}% {data.isStrong ? '✓' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-amber-400">#{data.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ASHTAKAVARGA ─── */}
      {activeSubTab === 'ashtakavarga' && (
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="border-b border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-lg text-stone-100">Sarvashtakavarga (SAV) Points by House</h3>
            <p className="text-xs text-stone-400">Average benchmark is 28 points. &gt;28 is highly favorable; &lt;25 is sensitive.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ashtakavarga.savByHouse.map((points, idx) => {
              const h = idx + 1;
              const isStrong = points >= 28;
              const isWeak = points < 25;
              return (
                <div
                  key={h}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isStrong
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : isWeak
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      : 'bg-stone-950 border-stone-800 text-stone-200'
                  }`}
                >
                  <span className="text-[11px] text-stone-400 uppercase font-semibold block">House {h}</span>
                  <span className="text-2xl font-bold font-serif my-1 block">{points}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900">
                    {isStrong ? 'Favorable' : isWeak ? 'Sensitive' : 'Average'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs text-stone-300">
            <strong>Total Rekhas Sum:</strong> {ashtakavarga.totalBindus} / 337 points.
          </div>
        </div>
      )}

      {/* ─── TAB 5: YOGAS, DOSHAS & SADE SATI ─── */}
      {activeSubTab === 'yogas' && (
        <div className="space-y-6">
          {/* Classical Yogas Detected */}
          <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Classical Yogas Present in Chart ({yogasReport.yogas.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {yogasReport.yogas.map((yoga) => (
                <div key={yoga.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-300 text-sm">
                      {yoga.name} ({yoga.sanskrit})
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {yoga.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {yoga.description[language] || yoga.description.en}
                  </p>
                  <div className="flex justify-between text-[10px] text-stone-500 pt-1">
                    <span>Planets: {yoga.planetsInvolved.join(', ')}</span>
                    <span>{yoga.classicalCitation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dosha Analysis Cards (Mangal, Kaal Sarp, Sade Sati) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mangal Dosha */}
            <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Mangal Dosha</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    yogasReport.mangalDosha.hasDosha
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {yogasReport.mangalDosha.intensity}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {yogasReport.mangalDosha.description[language] || yogasReport.mangalDosha.description.en}
              </p>
            </div>

            {/* Kaal Sarp Dosha */}
            <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Kaal Sarp Yoga</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    yogasReport.kaalSarpDosha.hasDosha
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {yogasReport.kaalSarpDosha.hasDosha ? yogasReport.kaalSarpDosha.type : 'None'}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {yogasReport.kaalSarpDosha.description[language] || yogasReport.kaalSarpDosha.description.en}
              </p>
            </div>

            {/* Sade Sati */}
            <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Shani Sade Sati</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    yogasReport.sadeSati.isActive
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {yogasReport.sadeSati.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {yogasReport.sadeSati.description[language] || yogasReport.sadeSati.description.en}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: VIMSHOTTARI DASHA TREE ─── */}
      {activeSubTab === 'dashaTree' && (
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="border-b border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-lg text-stone-100">120-Year Vimshottari Dasha Hierarchy</h3>
            <p className="text-xs text-stone-400">
              Computed from Moon Nakshatra ({dasha.startingLord} initial balance: {dasha.balanceYears} years).
            </p>
          </div>

          <div className="space-y-3">
            {dasha.mahadashas.map((md) => {
              const isCurrentMD = dasha.currentDasha.mahadasha.planet === md.planet;
              return (
                <div
                  key={md.planet}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentMD ? 'bg-amber-950/20 border-amber-500/40' : 'bg-stone-950 border-stone-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">{md.planet} Mahadasha</span>
                      {isCurrentMD && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px]">
                          CURRENTLY RUNNING
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      {formatDateFormatted(md.startDate)} — {formatDateFormatted(md.endDate)} ({Math.round(md.durationDays / 365.25)} yrs)
                    </span>
                  </div>

                  {/* Sub-periods (Antardashas) */}
                  {md.subPeriods && md.subPeriods.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-1.5 mt-2">
                      {md.subPeriods.map((ad) => {
                        const isCurrentAD = isCurrentMD && dasha.currentDasha.antardasha.planet === ad.planet;
                        return (
                          <div
                            key={ad.planet}
                            className={`p-2 rounded-xl border text-center text-[11px] ${
                              isCurrentAD
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900/80 text-stone-300 border-stone-800'
                            }`}
                          >
                            <span className="block font-semibold">{ad.planet}</span>
                            <span className="text-[9px] block opacity-80">
                              {formatMonthYear(ad.endDate)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
