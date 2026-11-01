'use client';

import React, { useState } from 'react';
import { ZODIAC_SIGNS, PLANETS, NAKSHATRAS } from '@/lib/astronomy/constants';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { BookOpen, Sparkles, Compass, Shield, Award, HelpCircle } from 'lucide-react';

interface LearnJyotishProps {
  language: LanguageCode;
}

export default function LearnJyotish({ language }: LearnJyotishProps) {
  const t = TRANSLATIONS[language];
  const [activeSection, setActiveSection] = useState<'grahas' | 'rashis' | 'bhavas' | 'dashas' | 'faq'>('grahas');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-1 border border-amber-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">{t.nav.learn}</h2>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
          Plain-language explainers of classical Vedic astronomical and astrological principles.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        {[
          { id: 'grahas', label: '9 Grahas (Planets)' },
          { id: 'rashis', label: '12 Rashis (Zodiac)' },
          { id: 'bhavas', label: '12 Bhavas (Houses)' },
          { id: 'dashas', label: 'Vimshottari Dashas' },
          { id: 'faq', label: 'Vedic vs Western FAQ' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as typeof activeSection)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* ─── SECTION 1: GRAHAS ─── */}
      {activeSection === 'grahas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(PLANETS).map((p) => (
            <div key={p.id} className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 text-base flex items-center gap-2">
                  <span className="font-mono text-lg">{p.glyph}</span>
                  {p.name} ({p.sanskrit})
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-950 font-mono text-stone-400">
                  {p.element}
                </span>
              </div>
              <div className="text-xs text-stone-300 space-y-1">
                <p><strong>Lord of Signs:</strong> {p.lordOf.map((s) => ZODIAC_SIGNS[s - 1].name).join(', ') || 'Nodes'}</p>
                <p><strong>Exalted In:</strong> {ZODIAC_SIGNS[p.exaltationSign - 1].name} ({p.exaltationDegree}°)</p>
                <p><strong>Debilitated In:</strong> {ZODIAC_SIGNS[p.debilitationSign - 1].name} ({p.debilitationDegree}°)</p>
                <p><strong>Gemstone:</strong> {p.gemstone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── SECTION 2: RASHIS ─── */}
      {activeSection === 'rashis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ZODIAC_SIGNS.map((s) => (
            <div key={s.number} className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 text-base">
                  {s.number}. {s.name} ({s.sanskrit}) {s.symbol}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-950 text-stone-400">
                  {s.element}
                </span>
              </div>
              <div className="text-xs text-stone-300 space-y-1">
                <p><strong>Ruling Lord:</strong> {s.lord}</p>
                <p><strong>Mobility:</strong> {s.mobility}</p>
                <p><strong>Gender:</strong> {s.gender}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── SECTION 3: BHAVAS ─── */}
      {activeSection === 'bhavas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { h: 1, name: 'Tanu Bhava (House 1)', domain: 'Self, Body, Vitality, Outlook, Character' },
            { h: 2, name: 'Dhana Bhava (House 2)', domain: 'Wealth, Family Lineage, Speech, Food, Liquid Assets' },
            { h: 3, name: 'Sahaja Bhava (House 3)', domain: 'Courage, Younger Siblings, Communication, Skill' },
            { h: 4, name: 'Sukha Bhava (House 4)', domain: 'Mother, Home, Real Estate, Vehicles, Inner Contentment' },
            { h: 5, name: 'Suta Bhava (House 5)', domain: 'Children, Intelligence, Creativity, Purva Punya, Romance' },
            { h: 6, name: 'Ripu Bhava (House 6)', domain: 'Health, Overcoming Competitors, Service, Debts' },
            { h: 7, name: 'Jaya Bhava (House 7)', domain: 'Marriage, Spouse, Business Partnerships, Foreign Public' },
            { h: 8, name: 'Ayu Bhava (House 8)', domain: 'Longevity, Transformation, Hidden Assets, Occult Science' },
            { h: 9, name: 'Dharma Bhava (House 9)', domain: 'Higher Wisdom, Guru, Fortune, Father, Pilgrimages' },
            { h: 10, name: 'Karma Bhava (House 10)', domain: 'Profession, Status, Fame, Authority, Social Leadership' },
            { h: 11, name: 'Labha Bhava (House 11)', domain: 'Gains, Aspirations, Elder Siblings, Large Networks' },
            { h: 12, name: 'Vyaya Bhava (House 12)', domain: 'Moksha, Foreign Lands, Spiritual Solitude, Expenses' },
          ].map((item) => (
            <div key={item.h} className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
              <h4 className="font-bold text-amber-400 text-sm">{item.name}</h4>
              <p className="text-xs text-stone-300">{item.domain}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── SECTION 4: DASHAS ─── */}
      {activeSection === 'dashas' && (
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4 text-xs sm:text-sm text-stone-200 leading-relaxed">
          <h3 className="font-serif font-bold text-lg text-amber-300">The 120-Year Vimshottari Dasha System</h3>
          <p>
            In Vedic astrology, life does not unfold randomly. The Vimshottari Dasha system divides the human lifespan of 120 years across 9 planetary lords in an exact fixed cycle:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-xs font-mono font-bold pt-2 pb-2">
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Ketu<br/><span className="text-stone-400 text-[10px]">7 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Venus<br/><span className="text-stone-400 text-[10px]">20 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Sun<br/><span className="text-stone-400 text-[10px]">6 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Moon<br/><span className="text-stone-400 text-[10px]">10 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Mars<br/><span className="text-stone-400 text-[10px]">7 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Rahu<br/><span className="text-stone-400 text-[10px]">18 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Jupiter<br/><span className="text-stone-400 text-[10px]">16 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Saturn<br/><span className="text-stone-400 text-[10px]">19 yrs</span></div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-amber-400">Mercury<br/><span className="text-stone-400 text-[10px]">17 yrs</span></div>
          </div>
          <p>
            Your starting Dasha at birth is determined by the <strong>exact degree of the Moon in its birth Nakshatra</strong>. The remaining portion of that Nakshatra determines the balance of Dasha years available in childhood.
          </p>
        </div>
      )}

      {/* ─── SECTION 5: FAQ ─── */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2 text-xs text-stone-300">
            <h4 className="font-bold text-amber-300 text-sm">Why is my Vedic sign different from my Western Sun sign?</h4>
            <p>
              Western astrology uses the Tropical zodiac (fixed to the seasons / vernal equinox), which drifts over time due to axial precession. Vedic astrology uses the <strong>Sidereal zodiac</strong> (anchored to physical stellar constellations using the Lahiri Ayanamsa, currently ~24° offset). Thus, your Vedic Sun and Moon sign are typically ~24 degrees earlier than Western charts.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2 text-xs text-stone-300">
            <h4 className="font-bold text-amber-300 text-sm">What is the significance of the North Indian Diamond Chart?</h4>
            <p>
              In North Indian charts, the 12 houses are fixed in geometry (House 1 is always the top central diamond), while the Zodiac Signs rotate depending on your Ascendant (Lagna). This makes analyzing Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) houses visually instantaneous.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
