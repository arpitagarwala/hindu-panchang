'use client';

import React, { useState } from 'react';
import { calculateAshtakoota, PartnerDetails, MatchmakingResult } from '@/lib/matchmaking/ashtakoota';
import { ZODIAC_SIGNS, NAKSHATRAS } from '@/lib/astronomy/constants';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { HeartHandshake, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface GunaMilanProps {
  language: LanguageCode;
}

export default function GunaMilan({ language }: GunaMilanProps) {
  const t = TRANSLATIONS[language];

  // Default demo partners
  const [partner1, setPartner1] = useState<PartnerDetails>({
    name: 'Partner 1 (Groom)',
    moonSign: 1, // Aries
    nakshatra: 1, // Ashwini
    pada: 1,
  });

  const [partner2, setPartner2] = useState<PartnerDetails>({
    name: 'Partner 2 (Bride)',
    moonSign: 2, // Taurus
    nakshatra: 4, // Rohini
    pada: 1,
  });

  const matchResult: MatchmakingResult = calculateAshtakoota(partner1, partner2);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-1 border border-amber-500/20">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">{t.gunaMilan.title}</h2>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
          Classical Parashari 36-point compatibility calculation evaluating psychological, physical, spiritual, and genetic alignment.
        </p>
      </div>

      {/* Input Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Partner 1 (Groom) */}
        <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-lg">
          <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {t.gunaMilan.boyDetails}
          </h3>

          <div>
            <label className="text-xs text-stone-400 block mb-1">Name</label>
            <input
              type="text"
              value={partner1.name}
              onChange={(e) => setPartner1({ ...partner1, name: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 block mb-1">Moon Sign (Rashi)</label>
              <select
                value={partner1.moonSign}
                onChange={(e) => setPartner1({ ...partner1, moonSign: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} ({s.sanskrit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Nakshatra</label>
              <select
                value={partner1.nakshatra}
                onChange={(e) => setPartner1({ ...partner1, nakshatra: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.number} value={n.number}>
                    {n.number}. {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Partner 2 (Bride) */}
        <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-lg">
          <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {t.gunaMilan.girlDetails}
          </h3>

          <div>
            <label className="text-xs text-stone-400 block mb-1">Name</label>
            <input
              type="text"
              value={partner2.name}
              onChange={(e) => setPartner2({ ...partner2, name: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 block mb-1">Moon Sign (Rashi)</label>
              <select
                value={partner2.moonSign}
                onChange={(e) => setPartner2({ ...partner2, moonSign: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} ({s.sanskrit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Nakshatra</label>
              <select
                value={partner2.nakshatra}
                onChange={(e) => setPartner2({ ...partner2, nakshatra: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.number} value={n.number}>
                    {n.number}. {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Match Verdict Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-amber-950/30 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Match Compatibility Verdict</span>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-100">{matchResult.verdict}</h3>
          <p className="text-xs text-stone-300 max-w-xl">
            {matchResult.verdictDescription[language] || matchResult.verdictDescription.en}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-950/80 px-6 py-4 rounded-2xl border border-stone-800">
          <div className="text-center">
            <span className="text-3xl sm:text-4xl font-bold font-serif text-amber-400">{matchResult.totalScore}</span>
            <span className="text-sm font-semibold text-stone-400"> / 36</span>
            <span className="block text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Total Gunas</span>
          </div>
        </div>
      </div>

      {/* 8 Kootas Breakdown Table */}
      <div className="rounded-3xl bg-stone-900/90 border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-stone-800">
          <h3 className="font-serif font-bold text-lg text-stone-100">8 Kootas Detailed Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">Koota</th>
                <th className="px-4 py-3">Obtained Points</th>
                <th className="px-4 py-3">Max Points</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Meaning & Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-medium">
              {Object.values(matchResult.kootas).map((koota) => {
                const isGood = koota.status === 'Excellent' || koota.status === 'Good';
                return (
                  <tr key={koota.name} className="hover:bg-stone-800/40 text-stone-200">
                    <td className="px-4 py-3 font-bold text-stone-100">
                      {koota.name} ({koota.sanskrit})
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-300">{koota.pointsObtained}</td>
                    <td className="px-4 py-3 font-mono text-stone-400">{koota.maxPoints}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {koota.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {koota.description[language] || koota.description.en}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
