'use client';

import React, { useState } from 'react';
import { ChartCalculationResult } from '@/lib/astronomy/ephemeris';
import { VimshottariResult } from '@/lib/astronomy/dasha';
import { ChoghadiyaResult } from '@/lib/astronomy/choghadiya';
import { DailyPersonalizedHoroscope } from '@/lib/astronomy/transits';
import { PanchangResult } from '@/lib/panchang';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { GRAHA_REMEDIES } from '@/lib/shastra/knowledgeBase';
import { formatTime12, formatDateFormatted } from '@/lib/utils/format';
import { getDetailedDashaInterpretation } from '@/lib/shastra/dashaInterpretations';
import { getDetailedTransitInsight } from '@/lib/shastra/transitInterpretations';
import KundaliViewer from '../Kundali/KundaliViewer';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  Flame,
  Compass,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Heart,
  TrendingUp,
  Download,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  BarChart3,
  Layers,
} from 'lucide-react';

interface SimpleModeDashboardProps {
  chart: ChartCalculationResult;
  dasha: VimshottariResult;
  choghadiya: ChoghadiyaResult;
  dailyTransits: DailyPersonalizedHoroscope;
  panchang: PanchangResult;
  language: LanguageCode;
  onNavigateTab: (tab: string) => void;
}

export default function SimpleModeDashboard({
  chart,
  dasha,
  choghadiya,
  dailyTransits,
  panchang,
  language,
  onNavigateTab,
}: SimpleModeDashboardProps) {
  const t = TRANSLATIONS[language];
  const curD = dasha.currentDasha;
  const activeChogh = choghadiya.activeSlot;
  const mdPlanet = curD.mahadasha.planet;
  const remedyInfo = GRAHA_REMEDIES[mdPlanet] || GRAHA_REMEDIES.Sun;

  // State for collapsible accordions
  const [showDashaWhy, setShowDashaWhy] = useState(false);
  const [showVibeWhy, setShowVibeWhy] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showRemedyWhy, setShowRemedyWhy] = useState(false);

  // Compute Classical Shastra-grounded interpretations
  const dashaInsight = getDetailedDashaInterpretation(chart, dasha, language);
  const transitInsight = getDetailedTransitInsight(chart, panchang, choghadiya, dailyTransits, dasha, language);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* ─── 1. TODAY'S PANCHANG & ACTIVE CHOGHADIYA HERO WIDGET ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 border border-amber-500/20 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Tithi, Vara, Nakshatra summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                {panchang.vara.english} ({panchang.vara.sanskrit})
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700">
                {panchang.tithi.paksha} Paksha
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700">
                Vikram Samvat {panchang.hinduMonth.samvat}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-100 tracking-tight">
                {panchang.tithi.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Nakshatra: <strong className="text-amber-400">{panchang.nakshatra.name}</strong> • Yoga: <strong className="text-stone-200">{panchang.yoga.name}</strong> • Karana: <strong className="text-stone-200">{panchang.karana.name}</strong>
              </p>
            </div>

            {/* Sun / Moon Timings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
              <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800/90">
                <span className="text-stone-400 block text-[11px] mb-0.5">{t.panchang.sunrise}</span>
                <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">{formatTime12(panchang.sunrise)}</span>
              </div>
              <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800/90">
                <span className="text-stone-400 block text-[11px] mb-0.5">{t.panchang.sunset}</span>
                <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">{formatTime12(panchang.sunset)}</span>
              </div>
              <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800/90">
                <span className="text-stone-400 block text-[11px] mb-0.5">{t.panchang.brahmaMuhurta}</span>
                <span className="font-bold text-stone-200 font-mono text-xs sm:text-sm">{formatTime12(panchang.brahmaMuhurta.start)}</span>
              </div>
              <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800/90">
                <span className="text-stone-400 block text-[11px] mb-0.5">{t.panchang.abhijitMuhurta}</span>
                <span className="font-bold text-emerald-400 font-mono text-xs sm:text-sm">{formatTime12(panchang.abhijitMuhurta.start)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Choghadiya & Rahu Kaal */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-950/50 p-4 sm:p-5 rounded-2xl border border-stone-800/80">
            {/* Active Choghadiya Slot */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-stone-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Active Choghadiya
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    activeChogh.meta.quality === 'Excellent'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : activeChogh.meta.quality === 'Good'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {activeChogh.meta.quality.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-300">
                {activeChogh.type} ({activeChogh.meta.sanskrit})
              </h3>
              <p className="text-xs text-stone-400">
                {activeChogh.startFormatted} – {activeChogh.endFormatted} • Ruler: {activeChogh.meta.ruler}
              </p>
              <p className="text-xs text-stone-300 pt-1">
                {activeChogh.meta.suitableFor[language] || activeChogh.meta.suitableFor.en}
              </p>
            </div>

            {/* Rahu Kaal Banner */}
            <div className="flex items-center justify-between bg-rose-950/30 border border-rose-900/40 px-3 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-semibold">{t.panchang.rahuKaal}:</span>
              </div>
              <span className="text-rose-200 font-mono text-[11px]">
                {formatTime12(panchang.rahuKalam.start)} – {formatTime12(panchang.rahuKalam.end)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. CURRENT LIFE CHAPTER (VIMSHOTTARI DASHA PROGRESS) ─── */}
      <section className="rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.dashboard.currentChapter}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                📜 Sourced from Shastra
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-100 mt-1">
              {dashaInsight.headline}
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('dasha')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-amber-400 hover:text-amber-300 text-xs font-bold border border-stone-700 transition-all shadow-sm"
          >
            <span>{t.dashboard.viewDashaDetails}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Narrative & Progress */}
        <div className="space-y-4">
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-4xl">
            {dashaInsight.narrative}
          </p>

          {/* Collapsible "Why am I seeing this?" Shastra Reasoning Box */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 overflow-hidden">
            <button
              onClick={() => setShowDashaWhy(!showDashaWhy)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-amber-300 hover:bg-stone-900/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Why am I seeing this? (Chart Facts & Classical Shastra Logic)
              </span>
              {showDashaWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDashaWhy && (
              <div className="px-4 py-3 border-t border-stone-800/80 space-y-3 text-xs bg-stone-950/90 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dashaInsight.whyReasoning.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold text-amber-400 block">{item.label}</span>
                      <p className="font-semibold text-stone-100">{item.fact}</p>
                      <p className="text-[11px] text-stone-400">{item.classicalRule}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-800/60">
                  <span>Classical Source: <strong className="text-amber-300/90 font-medium">{dashaInsight.sourceCitation}</strong></span>
                  <span className="text-emerald-400 font-medium">✓ Chart Verified</span>
                </div>
              </div>
            )}
          </div>

          {/* Mahadasha Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Mahadasha Progress ({curD.mahadasha.planet})</span>
              <span className="text-amber-400 font-bold">{curD.mahadasha.progressPercent}% Completed</span>
            </div>
            <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-700 shadow-md"
                style={{ width: `${Math.max(5, curD.mahadasha.progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Started {formatDateFormatted(curD.mahadasha.startDate)}</span>
              <span>{curD.mahadasha.daysRemaining} days remaining (Ends {formatDateFormatted(curD.mahadasha.endDate)})</span>
            </div>
          </div>

          {/* Antardasha Chip */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-stone-400 font-medium">Sub-period (Antardasha):</span>
            <div className="inline-flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <span className="font-bold text-amber-300">{curD.antardasha.planet}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300">{curD.antardasha.progressPercent}% completed</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">{curD.antardasha.daysRemaining} days left</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. DAILY VIBE & QUICK KUNDALI PREVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Cosmic Alignment Card */}
        <div className="lg:col-span-5 rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {t.dashboard.todayVibe}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Score: {transitInsight.vibeScore}/100 • {transitInsight.scoreGrade}
              </span>
            </div>

            <h4 className="text-xl font-bold font-serif text-stone-100">{transitInsight.vibeTitle}</h4>

            {/* Daily Advice Do / Avoid (Sourced from Tithi + Choghadiya + Gochar) */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 space-y-0.5">
                <span className="font-bold block text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recommended Today (शुभ कर्म):
                </span>
                <p>{transitInsight.recommendationDo}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200 space-y-0.5">
                <span className="font-bold block text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Avoid Today (वर्जित / सावधानी):
                </span>
                <p>{transitInsight.recommendationAvoid}</p>
              </div>
            </div>

            {/* Collapsible 5-Pillar Score Breakdown */}
            <div className="rounded-xl border border-stone-800 bg-stone-950/60 overflow-hidden text-xs">
              <button
                onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-amber-300 hover:text-amber-200 hover:bg-stone-900/60 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  Score Formula Breakdown (5 Pillars • {transitInsight.vibeScore}/100)
                </span>
                {showScoreBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showScoreBreakdown && (
                <div className="px-3 py-3 border-t border-stone-800 space-y-2.5 bg-stone-950/90 text-[11px] animate-in fade-in duration-200">
                  <div className="space-y-2">
                    {transitInsight.pillars.map((p) => {
                      const percent = Math.round((p.score / p.maxScore) * 100);
                      const barColor =
                        p.status === 'excellent'
                          ? 'bg-emerald-500'
                          : p.status === 'good'
                          ? 'bg-amber-400'
                          : p.status === 'neutral'
                          ? 'bg-blue-400'
                          : 'bg-rose-500';
                      return (
                        <div key={p.id} className="p-2 rounded-lg bg-stone-900/70 border border-stone-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-200">{p.name}</span>
                            <span className="font-mono font-bold text-amber-300">
                              {p.score} / {p.maxScore} pts
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                          </div>
                          <p className="text-[10px] text-stone-400 leading-tight pt-0.5">{p.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-800/60 flex items-center justify-between">
                    <span>Formula: Tara (25) + Chandra (20) + Gochar (20) + Maitri (15) + Panchang (20) = 100</span>
                    <span className="text-emerald-400 font-medium">✓ Classical Shastra Model</span>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Transit & Muhurat Reasoning */}
            <div className="rounded-xl border border-stone-800 bg-stone-950/60 overflow-hidden text-xs">
              <button
                onClick={() => setShowVibeWhy(!showVibeWhy)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-stone-400 hover:text-amber-300 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Why am I seeing this recommendation?
                </span>
                {showVibeWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showVibeWhy && (
                <div className="px-3 py-2.5 border-t border-stone-800 space-y-2 bg-stone-950/90 text-[11px]">
                  {transitInsight.whyReasoning.map((item, idx) => (
                    <div key={idx} className="border-b border-stone-800/60 pb-1.5 last:border-none last:pb-0">
                      <strong className="text-amber-400">{item.label}:</strong> <span className="text-stone-200">{item.fact}</span>
                      <p className="text-stone-400 text-[10px] mt-0.5">{item.classicalRule}</p>
                    </div>
                  ))}
                  <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-800/60">
                    Source: <span className="text-stone-400">{transitInsight.sourceCitation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Recommended Remedy */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {t.dashboard.remedyRecommendation} ({mdPlanet})
              </span>
              <button onClick={() => onNavigateTab('remedies')} className="text-[11px] text-stone-400 hover:text-amber-300">
                All Remedies →
              </button>
            </div>
            <p className="text-xs text-stone-300">
              {remedyInfo.lifestyle[language] || remedyInfo.lifestyle.en}
            </p>
            <p className="text-[11px] text-amber-300/80 font-mono">
              Beej Mantra: {remedyInfo.mantra.beej}
            </p>

            {/* Collapsible Remedy Reasoning */}
            <div className="border-t border-stone-800/80 pt-1.5">
              <button
                onClick={() => setShowRemedyWhy(!showRemedyWhy)}
                className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>Why {mdPlanet} remedy?</span>
                {showRemedyWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showRemedyWhy && (
                <p className="text-[11px] text-stone-400 mt-1 bg-stone-900/60 p-2 rounded-lg border border-stone-800">
                  💡 Based on <strong>BPHS Chapter 56</strong>: Performing remedies for the active Mahadasha Lord ({mdPlanet}) pacifies planetary afflictions and balances the governing karmic cycle.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Kundali Chart Preview */}
        <div className="lg:col-span-7 rounded-3xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Birth Chart Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  D1 Rashi
                </span>
              </div>
              <h4 className="text-lg font-bold text-stone-100 font-serif mt-0.5">
                {chart.ascendant.signName} Lagna ({chart.ascendant.dms})
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('chart')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-bold border border-amber-500/30 transition-all shadow-sm"
            >
              <span>{t.dashboard.viewFullChart}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full flex flex-col items-center">
            <KundaliViewer chart={chart} language={language} showControls={false} variant="compact" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-800/60">
            <span>💡 Tap any planet or house to inspect</span>
            <span className="font-mono text-stone-400">Click Expand for Full-Screen Popup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
