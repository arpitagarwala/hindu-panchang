'use client';

import React, { useState } from 'react';
import { GRAHA_REMEDIES, GrahaRemedy } from '@/lib/shastra/knowledgeBase';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { Flame, Sparkles, Gem, HeartHandshake, BookOpen, Sun, Moon } from 'lucide-react';

interface RemediesLibraryProps {
  language: LanguageCode;
}

export default function RemediesLibrary({ language }: RemediesLibraryProps) {
  const t = TRANSLATIONS[language];
  const [selectedPlanet, setSelectedPlanet] = useState<string>('Sun');

  const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const activeRemedy: GrahaRemedy = GRAHA_REMEDIES[selectedPlanet] || GRAHA_REMEDIES.Sun;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-2 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-1 border border-amber-500/20">
          <Flame className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">Vedic Remedies & Shastra Mantras</h2>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
          Authentic remedies sourced from Brihat Parashara Hora Shastra — Beej mantras, gemstones, fasts, and charitable daan.
        </p>
      </div>

      {/* Planet Selector Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        {planetList.map((p) => {
          const isSelected = selectedPlanet === p;
          return (
            <button
              key={p}
              onClick={() => setSelectedPlanet(p)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              {p} ({GRAHA_REMEDIES[p]?.sanskrit || p})
            </button>
          );
        })}
      </div>

      {/* Active Remedy Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mantras Card */}
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 border-b border-stone-800 pb-3">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Vedic & Beej Mantras</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block mb-1 font-semibold">Beej Mantra (Daily Chanting)</span>
              <p className="font-serif text-sm font-bold text-amber-300 leading-relaxed">
                {activeRemedy.mantra.beej}
              </p>
              <span className="text-[10px] text-stone-500 block mt-1">Recommended Chants: 108 times daily</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block mb-1 font-semibold">Gayatri Mantra</span>
              <p className="font-serif text-xs font-medium text-stone-200 leading-relaxed">
                {activeRemedy.mantra.gayatri}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
              <span className="text-stone-400 block mb-1 font-semibold">Vedic Stotra</span>
              <p className="font-serif text-xs text-stone-300 leading-relaxed">
                {activeRemedy.mantra.vedic}
              </p>
            </div>
          </div>
        </div>

        {/* Gemstone & Metal Card */}
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 border-b border-stone-800 pb-3">
            <Gem className="w-4 h-4" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Gemstone (Ratna) Guidelines</h3>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Gemstone:</span>
              <span className="font-bold text-amber-300 text-sm">{activeRemedy.gemstone.name} ({activeRemedy.gemstone.hindiName})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Ideal Metal:</span>
              <span className="font-medium text-stone-200">{activeRemedy.gemstone.metal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Finger:</span>
              <span className="font-medium text-stone-200">{activeRemedy.gemstone.finger}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Wearing Time:</span>
              <span className="font-medium text-stone-200">{activeRemedy.gemstone.wearingDay}</span>
            </div>
            <div className="pt-2 border-t border-stone-800/80 text-[11px] text-amber-400/90">
              <strong>Caution:</strong> {activeRemedy.gemstone.caution}
            </div>
          </div>

          {/* Charity & Fasting */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
              <span className="text-amber-400 block font-semibold mb-1">Daan (Charitable Offerings)</span>
              <p className="text-stone-300">Items: {activeRemedy.charity.items.join(', ')}</p>
              <p className="text-stone-400 text-[11px] mt-0.5">Best Day: {activeRemedy.charity.bestDay} • Recipient: {activeRemedy.charity.beneficiary}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
              <span className="text-amber-400 block font-semibold mb-1">Vrat & Fasting</span>
              <p className="text-stone-300">{activeRemedy.fasting.day} ({activeRemedy.fasting.deity})</p>
              <p className="text-stone-400 text-[11px] mt-0.5">{activeRemedy.fasting.significance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practical Lifestyle Alignment */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-2">
        <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
          Practical Everyday Lifestyle Alignment
        </h4>
        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
          {activeRemedy.lifestyle[language] || activeRemedy.lifestyle.en}
        </p>
      </div>
    </div>
  );
}
