'use client';

import React, { useState } from 'react';
import { calculateNumerology, NumerologyProfile } from '@/lib/numerology/calculator';
import { ChartCalculationResult } from '@/lib/astronomy/ephemeris';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { safeParseDateTime } from '@/lib/utils/format';
import { Sparkles, Hash, Award, CheckCircle, Palette, Calendar } from 'lucide-react';

interface NumerologyViewerProps {
  chart?: ChartCalculationResult;
  language: LanguageCode;
}

export default function NumerologyViewer({ chart, language }: NumerologyViewerProps) {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('Arpit Agarwala');
  const [dobStr, setDobStr] = useState('1998-08-15');

  const profile: NumerologyProfile = calculateNumerology(name, safeParseDateTime(dobStr, '12:00'), chart);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Hash className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">NUMERIC COSMIC RESONANCE</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">{t.numerology.title}</h2>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs text-stone-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Date of Birth</label>
            <input
              type="date"
              value={dobStr}
              onChange={(e) => setDobStr(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Core Numbers Cards (Mulank, Bhagyank, Namank) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mulank */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-amber-950/20 border border-amber-500/30 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.numerology.mulank}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-amber-300">{profile.vedic.mulank}</span>
            <span className="text-xs font-semibold text-stone-300">
              Ruled by {profile.vedic.mulankLord} ({profile.vedic.mulankSanskrit})
            </span>
          </div>
          <p className="text-xs text-stone-300 pt-1 leading-relaxed">
            {profile.readings.mulankMeaning[language] || profile.readings.mulankMeaning.en}
          </p>
        </div>

        {/* Bhagyank */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-amber-950/20 border border-amber-500/30 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.numerology.bhagyank}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-amber-300">{profile.vedic.bhagyank}</span>
            <span className="text-xs font-semibold text-stone-300">
              Ruled by {profile.vedic.bhagyankLord} ({profile.vedic.bhagyankSanskrit})
            </span>
          </div>
          <p className="text-xs text-stone-300 pt-1 leading-relaxed">
            {profile.readings.bhagyankMeaning[language] || profile.readings.bhagyankMeaning.en}
          </p>
        </div>

        {/* Namank */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-amber-950/20 border border-amber-500/30 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.numerology.namank}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-amber-300">{profile.vedic.namank}</span>
            <span className="text-xs font-semibold text-stone-300">
              Chaldean: {profile.western.chaldeanDestiny} • Pyth: {profile.western.pythagoreanDestiny}
            </span>
          </div>
          <p className="text-xs text-stone-300 pt-1 leading-relaxed">
            Soul Urge: <strong className="text-amber-300">{profile.western.soulUrge}</strong> • Personality: <strong className="text-amber-300">{profile.western.personalityNumber}</strong>
          </p>
        </div>
      </div>

      {/* Cross-Reference Chart Synthesis */}
      {profile.readings.chartSynthesis && (
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t.numerology.chartCrossReference}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Alignment: {profile.readings.chartSynthesis.alignmentScore}%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            {profile.readings.chartSynthesis[language] || profile.readings.chartSynthesis.en}
          </p>
        </div>
      )}

      {/* Lucky Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
          <span className="text-stone-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Lucky & Friendly Numbers
          </span>
          <p className="font-bold text-amber-300 text-sm">
            {profile.luckyAttributes.friendlyNumbers.join(', ')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
          <span className="text-stone-400 font-semibold flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Lucky Colors
          </span>
          <p className="font-bold text-stone-200 text-sm">
            {profile.luckyAttributes.luckyColors.join(', ')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
          <span className="text-stone-400 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Lucky Days & Gem
          </span>
          <p className="font-bold text-stone-200 text-sm">
            {profile.luckyAttributes.luckyDays.join(', ')} • {profile.luckyAttributes.gemstone}
          </p>
        </div>
      </div>
    </div>
  );
}
