'use client';

import React, { useState, useEffect } from 'react';
import { calculateVedicChart, ChartCalculationResult } from '@/lib/astronomy/ephemeris';
import { calculateVimshottariDasha, VimshottariResult } from '@/lib/astronomy/dasha';
import { calculateChoghadiya, ChoghadiyaResult } from '@/lib/astronomy/choghadiya';
import { calculatePersonalizedDailyTransits, DailyPersonalizedHoroscope } from '@/lib/astronomy/transits';
import { computePanchang, PanchangResult } from '@/lib/panchang';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { safeParseDateTime } from '@/lib/utils/format';

// Components
import Navbar from '@/components/Navigation/Navbar';
import SimpleModeDashboard from '@/components/Dashboard/SimpleModeDashboard';
import ProModeDashboard from '@/components/Dashboard/ProModeDashboard';
import KundaliViewer from '@/components/Kundali/KundaliViewer';
import GunaMilan from '@/components/Features/GunaMilan';
import DashaJournal from '@/components/Features/DashaJournal';
import NumerologyViewer from '@/components/Features/NumerologyViewer';
import RemediesLibrary from '@/components/Features/RemediesLibrary';
import LearnJyotish from '@/components/Features/LearnJyotish';
import CityAutocomplete from '@/components/Common/CityAutocomplete';

import { Sparkles, Calendar, Clock, MapPin, User, Edit3, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function VedicPlatformHome() {
  const [mode, setMode] = useState<'simple' | 'pro'>('simple');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Birth Details State (Defaulting to reference chart: 15 Aug 1947 / custom user)
  const [userName, setUserName] = useState('User');
  const [birthDate, setBirthDate] = useState('1998-08-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [latitude, setLatitude] = useState(28.6139); // New Delhi
  const [longitude, setLongitude] = useState(77.2090);
  const [timezone, setTimezone] = useState(5.5);
  const [cityName, setCityName] = useState('New Delhi, India');
  const [showBirthEditor, setShowBirthEditor] = useState(false);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load Saved Preferences
  useEffect(() => {
    setMounted(true);
    try {
      const savedBirth = localStorage.getItem('jyotish_user_birth');
      if (savedBirth) {
        const parsed = JSON.parse(savedBirth);
        setUserName(parsed.userName || 'User');
        setBirthDate(parsed.birthDate || '1998-08-15');
        setBirthTime(parsed.birthTime || '14:30');
        setLatitude(isNaN(Number(parsed.latitude)) ? 28.6139 : Number(parsed.latitude));
        setLongitude(isNaN(Number(parsed.longitude)) ? 77.2090 : Number(parsed.longitude));
        setTimezone(isNaN(Number(parsed.timezone)) ? 5.5 : Number(parsed.timezone));
        setCityName(parsed.cityName || 'New Delhi, India');
      }
      const savedLang = localStorage.getItem('jyotish_lang') as LanguageCode;
      if (savedLang) setLanguage(savedLang);
      const savedMode = localStorage.getItem('jyotish_mode') as 'simple' | 'pro';
      if (savedMode) setMode(savedMode);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBirthProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const safeLat = isNaN(Number(latitude)) ? 28.6139 : Number(latitude);
    const safeLon = isNaN(Number(longitude)) ? 77.2090 : Number(longitude);
    const safeTz = isNaN(Number(timezone)) ? 5.5 : Number(timezone);
    const profile = { userName, birthDate, birthTime, latitude: safeLat, longitude: safeLon, timezone: safeTz, cityName };
    localStorage.setItem('jyotish_user_birth', JSON.stringify(profile));
    setShowBirthEditor(false);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('jyotish_lang', lang);
  };

  const handleModeToggle = (newMode: 'simple' | 'pro') => {
    setMode(newMode);
    localStorage.setItem('jyotish_mode', newMode);
  };

  // Astronomical Calculations
  const birthDateTimeObj = safeParseDateTime(birthDate, birthTime);
  const now = new Date();

  const safeLat = isNaN(Number(latitude)) ? 28.6139 : Number(latitude);
  const safeLon = isNaN(Number(longitude)) ? 77.2090 : Number(longitude);
  const safeTz = isNaN(Number(timezone)) ? 5.5 : Number(timezone);

  const chart: ChartCalculationResult = calculateVedicChart(
    birthDateTimeObj,
    safeLat,
    safeLon,
    safeTz,
    'lahiri'
  );

  const dasha: VimshottariResult = calculateVimshottariDasha(
    birthDateTimeObj,
    chart.planets.Moon.siderealLon,
    now,
    3
  );

  const choghadiya: ChoghadiyaResult = calculateChoghadiya(now, safeLat, safeLon);
  const dailyTransits: DailyPersonalizedHoroscope = calculatePersonalizedDailyTransits(chart, now, safeLat, safeLon);
  const panchang: PanchangResult = computePanchang(safeLat, safeLon, now);

  const t = TRANSLATIONS[language];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d0a08] text-stone-100 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-stone-950" />
          </div>
          <span className="font-serif text-amber-400 text-sm font-bold tracking-widest uppercase">
            Loading Vedic Life OS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0a08] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      <a href="/" className="block px-6 py-3 text-xs text-amber-300 border-b border-stone-800 hover:text-amber-200">
        ← Back to your daily Panchang
      </a>
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onToggleMode={handleModeToggle}
        language={language}
        onChangeLanguage={handleLanguageChange}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* User Quick Info Bar */}
      <div className="w-full bg-stone-950/60 border-b border-stone-800/60 py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-stone-200 font-semibold">
              <User className="w-3.5 h-3.5 text-amber-400" />
              {userName}
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              {birthDate} {birthTime}
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              {cityName}
            </span>
          </div>

          <button
            onClick={() => setShowBirthEditor(!showBirthEditor)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {showBirthEditor ? 'Close' : 'Change Birth Data'}
          </button>
        </div>

        {/* Expandable Birth Profile Editor */}
        {showBirthEditor && (
          <form
            onSubmit={saveBirthProfile}
            className="max-w-7xl mx-auto mt-3 p-5 rounded-2xl bg-stone-900 border border-amber-500/30 space-y-4 text-xs animate-in fade-in shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Name */}
              <div>
                <label className="text-stone-300 block mb-1.5 font-medium">Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Birth Date & Time */}
              <div>
                <label className="text-stone-300 block mb-1.5 font-medium">Birth Date & Time</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-3/5 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-2/5 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Place of Birth Autocomplete */}
              <div>
                <label className="text-stone-300 block mb-1.5 font-medium">Place of Birth (City)</label>
                <CityAutocomplete
                  value={cityName}
                  onSelect={(city) => {
                    const formatted = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
                    setCityName(formatted);
                    setLatitude(city.latitude);
                    setLongitude(city.longitude);
                    if (city.timezone !== undefined) setTimezone(city.timezone);
                  }}
                  placeholder="Search city (e.g. Mumbai, Jaipur, London)..."
                />
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recalculate Kundali
                </button>
              </div>
            </div>

            {/* Optional Collapsible GPS Fine-Tuning */}
            <div className="pt-2 border-t border-stone-800/80 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors self-start"
              >
                {showAdvancedCoords ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showAdvancedCoords ? 'Hide Manual Coordinates' : 'Manual GPS Coordinates & Timezone (Optional)'}
                <span className="text-stone-500 font-mono ml-1">
                  [{safeLat.toFixed(2)}°N, {safeLon.toFixed(2)}°E • UTC{safeTz >= 0 ? `+${safeTz}` : safeTz}]
                </span>
              </button>

              {showAdvancedCoords && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Latitude (°N/S)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={isNaN(latitude) ? '' : latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Longitude (°E/W)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={isNaN(longitude) ? '' : longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Timezone Offset (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={isNaN(timezone) ? '' : timezone}
                      onChange={(e) => setTimezone(parseFloat(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 py-4 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          mode === 'simple' ? (
            <SimpleModeDashboard
              chart={chart}
              dasha={dasha}
              choghadiya={choghadiya}
              dailyTransits={dailyTransits}
              panchang={panchang}
              language={language}
              onNavigateTab={setActiveTab}
            />
          ) : (
            <ProModeDashboard
              chart={chart}
              dasha={dasha}
              language={language}
            />
          )
        )}

        {activeTab === 'chart' && (
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-4">
            <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl">
              <KundaliViewer chart={chart} language={language} />
            </div>
          </div>
        )}

        {activeTab === 'dasha' && (
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
            <ProModeDashboard chart={chart} dasha={dasha} language={language} />
          </div>
        )}

        {activeTab === 'matchmaking' && (
          <GunaMilan language={language} />
        )}

        {activeTab === 'numerology' && (
          <NumerologyViewer chart={chart} language={language} />
        )}

        {activeTab === 'journal' && (
          <DashaJournal dasha={dasha} language={language} />
        )}

        {activeTab === 'remedies' && (
          <RemediesLibrary language={language} />
        )}

        {activeTab === 'learn' && (
          <LearnJyotish language={language} />
        )}
      </main>

      {/* Global Astrological Footer */}
      <footer className="w-full bg-stone-950 border-t border-stone-800/80 py-6 pb-24 md:pb-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p className="text-sm text-stone-300 pb-2">Created and owned by <strong>Arpit Agarwala</strong> · <a href="https://arpitagarwala.com" target="_blank" rel="noreferrer" className="text-amber-300 underline underline-offset-4">arpitagarwala.com</a></p>
        <p className="font-serif text-stone-400">
          Vedic Astrology Life OS • High-Precision Sidereal Ephemeris Core (Lahiri Ayanamsa)
        </p>
        <p className="text-[11px] text-stone-600">
          Classical Jyotish interpretation engine based on BPHS, Phaladeepika, and Saravali. Runs 100% free with zero cloud compute limits.
        </p>
      </footer>
    </div>
  );
}
