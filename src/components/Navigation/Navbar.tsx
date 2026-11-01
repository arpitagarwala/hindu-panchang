'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import {
  Sparkles,
  Compass,
  Clock,
  HeartHandshake,
  Hash,
  BookOpen,
  Flame,
  GraduationCap,
  ChevronDown,
  Settings,
  X,
  Grid,
  Check,
  Globe,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface NavbarProps {
  mode: 'simple' | 'pro';
  onToggleMode: (mode: 'simple' | 'pro') => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export default function Navbar({
  mode,
  onToggleMode,
  language,
  onChangeLanguage,
  activeTab,
  onSelectTab,
}: NavbarProps) {
  const t = TRANSLATIONS[language];
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false);
      }
      if (
        settingsModalRef.current &&
        !settingsModalRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Top-level direct navigation items (High-frequency daily visits)
  const primaryNavItems = [
    {
      id: 'dashboard',
      label: t.nav.todayPanchang,
      shortLabel: 'Today',
      icon: Compass,
      description: 'Daily Tithi, Muhurats & Choghadiya',
    },
    {
      id: 'chart',
      label: t.nav.birthChart,
      shortLabel: 'Kundali',
      icon: Sparkles,
      description: 'Lagna, Vargas & Graha Degrees',
    },
    {
      id: 'dasha',
      label: t.nav.dashaTimeline,
      shortLabel: 'Dasha',
      icon: Clock,
      description: 'Vimshottari 120-Year Timeline',
    },
  ];

  // Secondary tools (Grouped behind "More Tools" dropdown on Desktop & Drawer on Mobile)
  const secondaryNavItems = [
    {
      id: 'matchmaking',
      label: t.nav.matchmaking,
      icon: HeartHandshake,
      description: 'Ashtakoota 36-Guna Parashari Milan',
      category: 'Compatibility',
    },
    {
      id: 'numerology',
      label: t.nav.numerology,
      icon: Hash,
      description: 'Mulank, Bhagyank & Cosmic Numbers',
      category: 'Numerology',
    },
    {
      id: 'journal',
      label: t.nav.journal,
      icon: BookOpen,
      description: 'Correlate Life Events with Planetary Dashas',
      category: 'Tracking',
    },
    {
      id: 'remedies',
      label: t.nav.remedies,
      icon: Flame,
      description: 'Mantras, Gemstones, Daan & Vrats',
      category: 'Shastra Upay',
    },
    {
      id: 'learn',
      label: t.nav.learn,
      icon: GraduationCap,
      description: 'Bhavas, Rashis & Graha Fundamentals',
      category: 'Education',
    },
  ];

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    setIsToolsOpen(false);
    setIsMobileDrawerOpen(false);
  };

  const isSecondaryActive = secondaryNavItems.some(
    (item) => item.id === activeTab
  );
  const activeSecondaryItem = secondaryNavItems.find(
    (item) => item.id === activeTab
  );

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER (Desktop & Mobile Minimal Bar)
      ────────────────────────────────────────────────────────── */}
      <header className="w-full bg-stone-950/90 backdrop-blur-xl border-b border-stone-800/80 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo & Title */}
            <button
              onClick={() => handleSelect('dashboard')}
              className="flex items-center gap-3 group text-left min-h-[44px] min-w-[44px] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 p-1 -ml-1 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Sparkles className="w-5 h-5 text-stone-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold tracking-tight text-stone-100 group-hover:text-amber-300 transition-colors">
                    JYOTISH
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                      mode === 'pro'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    {mode === 'pro' ? 'PRO' : 'VEDIC OS'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 hidden sm:block truncate">
                  Sidereal Astronomical Platform
                </p>
              </div>
            </button>

            {/* Desktop Navigation Row (Direct primary links + More Tools dropdown) */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-amber-400' : 'text-stone-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* "More Tools" Grouped Dropdown on Desktop */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                    isSecondaryActive || isToolsOpen
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                  }`}
                  aria-expanded={isToolsOpen}
                >
                  <Grid className="w-4 h-4 text-stone-400" />
                  <span>
                    {isSecondaryActive && activeSecondaryItem
                      ? activeSecondaryItem.label
                      : 'More Tools'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isToolsOpen ? 'rotate-180 text-amber-400' : 'text-stone-400'
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isToolsOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-stone-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      Astrological Tools & Shastra
                    </div>
                    {secondaryNavItems.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeTab === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleSelect(tool.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all min-h-[44px] ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'text-stone-200 hover:bg-stone-800/80 hover:text-white border border-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              isActive
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-stone-950 text-stone-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs block">
                                {tool.label}
                              </span>
                              {isActive && (
                                <Check className="w-3.5 h-3.5 text-amber-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                              {tool.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Settings & Preferences Trigger (44x44px minimum) */}
            <div className="relative" ref={settingsModalRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] min-w-[44px] border ${
                  isSettingsOpen
                    ? 'bg-stone-900 border-amber-500/40 text-amber-300'
                    : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-900'
                }`}
                title="Preferences: Mode & Language"
                aria-label="Preferences: Mode and Language"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-mono uppercase text-[11px] text-stone-300">
                  {language.toUpperCase()} • {mode === 'pro' ? 'PRO' : 'SIMPLE'}
                </span>
              </button>

              {/* Preferences Popover */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-stone-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span className="font-serif font-bold text-sm text-stone-100">
                        Platform Preferences
                      </span>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Language Preference */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-stone-400" />
                      Language / भाषा
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'hi', label: 'हिन्दी' },
                        { code: 'hinglish', label: 'Hinglish' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => onChangeLanguage(lang.code as LanguageCode)}
                          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                            language === lang.code
                              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Mode Preference (Simple vs Pro) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-stone-400" />
                      Experience Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onToggleMode('simple')}
                        className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all ${
                          mode === 'simple'
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span className="font-bold text-xs block">
                          {t.nav.simpleMode}
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Daily vibe & Life Chapters
                        </span>
                      </button>

                      <button
                        onClick={() => onToggleMode('pro')}
                        className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all ${
                          mode === 'pro'
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span className="font-bold text-xs block">
                          {t.nav.proMode}
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Exact degrees & Shadbala
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. MOBILE FIXED BOTTOM TAB BAR (Thumb-Friendly PWA Bar)
      ────────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/90 px-2 py-1 shadow-2xl safe-area-pb">
        <div className="grid grid-cols-4 items-center justify-around gap-1 max-w-md mx-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-amber-500/20 scale-105' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}

          {/* 4th Tab: "More Tools" Drawer Trigger */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              isSecondaryActive || isMobileDrawerOpen
                ? 'text-amber-400 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isSecondaryActive || isMobileDrawerOpen
                  ? 'bg-amber-500/20 scale-105'
                  : ''
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate">
              {isSecondaryActive && activeSecondaryItem
                ? activeSecondaryItem.label.split(' ')[0]
                : 'More'}
            </span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. MOBILE "MORE TOOLS & PREFERENCES" BOTTOM SHEET / DRAWER
      ────────────────────────────────────────────────────────── */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full bg-stone-900 border-t border-stone-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Astrological Tools & Modules
                </h3>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-stone-950 text-stone-400 hover:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center border border-stone-800"
                aria-label="Close tools menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tools Grid */}
            <div className="space-y-2">
              {secondaryNavItems.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all min-h-[56px] ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 ${
                          isActive
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-900 text-amber-400 border border-stone-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-sm block truncate">
                          {tool.label}
                        </span>
                        <span className="text-xs text-stone-400 block truncate">
                          {tool.description}
                        </span>
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-amber-400' : 'text-stone-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Preferences in Mobile Drawer */}
            <div className="pt-3 border-t border-stone-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Session Preferences
              </div>

              {/* Language Switch */}
              <div className="grid grid-cols-3 gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'hinglish', label: 'Hinglish' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onChangeLanguage(lang.code as LanguageCode)}
                    className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                      language === lang.code
                        ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Mode Switch */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onToggleMode('simple')}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    mode === 'simple'
                      ? 'bg-amber-500 text-stone-950 shadow-md border-amber-400'
                      : 'bg-stone-950 text-stone-400 border-stone-800'
                  }`}
                >
                  Simple Life OS
                </button>
                <button
                  onClick={() => onToggleMode('pro')}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    mode === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md border-amber-400'
                      : 'bg-stone-950 text-stone-400 border-stone-800'
                  }`}
                >
                  Pro Astrologer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
