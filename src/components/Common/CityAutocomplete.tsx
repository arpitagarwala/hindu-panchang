'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Check } from 'lucide-react';
import { CityInfo, searchLocalCities } from '@/lib/geo/cities';

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: CityInfo) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({
  value,
  onSelect,
  placeholder = 'Type city name (e.g. Mumbai, Jaipur, London)...',
  className = '',
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal query with prop when prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    // Fast local lookup first
    const local = searchLocalCities(query, 6);
    setResults(local);

    if (query.trim().length < 2) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setResults(data.results);
          }
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (city: CityInfo) => {
    const formatted = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
    setQuery(formatted);
    setIsOpen(false);
    onSelect(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner"
        />
        <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 pointer-events-none" />
        {loading ? (
          <Loader2 className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 animate-spin pointer-events-none" />
        ) : (
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3 pointer-events-none" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl backdrop-blur-lg divide-y divide-stone-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400">
              {loading ? 'Searching city coordinates...' : 'No cities found. Try typing another city or district.'}
            </div>
          ) : (
            results.map((city, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${city.name}-${city.latitude}-${city.longitude}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-amber-500/15 text-amber-300' : 'text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    <div className="truncate">
                      <span className="font-semibold text-sm block truncate">
                        {city.name}
                        {city.state && <span className="font-normal text-stone-400 text-xs ml-1">({city.state})</span>}
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate">{city.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-950/80 border border-stone-800 text-stone-400">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
