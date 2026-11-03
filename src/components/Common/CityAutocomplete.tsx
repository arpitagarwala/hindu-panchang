'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Search, Loader2, Check } from 'lucide-react';
import { CityInfo, searchLocalCities } from '@/lib/geo/cities';

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: CityInfo) => void;
  placeholder?: string;
  className?: string;
  ariaLabelledBy?: string;
  onSelectionPendingChange?: (pending:boolean)=>void;
}

export default function CityAutocomplete({
  value,
  onSelect,
  placeholder = 'Type city name (e.g. Mumbai, Jaipur, London)...',
  className = '',
  ariaLabelledBy,
  onSelectionPendingChange,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [sourceValue,setSourceValue]=useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [remote,setRemote]=useState<{query:string;results:CityInfo[]}|null>(null);
  const [loadingQuery,setLoadingQuery]=useState<string|null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId=useId();

  if(sourceValue!==value){setSourceValue(value);setQuery(value);}
  const results=remote?.query===query?remote.results:searchLocalCities(query,6);
  const loading=isOpen&&loadingQuery===query;

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

    if (query.trim().length < 2) return;

    const controller=new AbortController();
    const timer = setTimeout(async () => {
      setLoadingQuery(query);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`,{signal:controller.signal});
        if (res.ok) {
          const data = await res.json();
          if (!controller.signal.aborted && data.results && data.results.length > 0) {
            setRemote({query,results:data.results});
          }
        }
      } catch (err) {
        if(!controller.signal.aborted)console.error('Failed to fetch cities:', err);
      } finally {
        if(!controller.signal.aborted)setLoadingQuery(null);
      }
    }, 300);

    return () => {clearTimeout(timer);controller.abort();};
  }, [query, isOpen]);

  const handleSelect = (city: CityInfo) => {
    const formatted = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
    setQuery(formatted);
    setIsOpen(false);
    onSelectionPendingChange?.(false);
    onSelect(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
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
          aria-labelledby={ariaLabelledBy}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen&&selectedIndex>=0?`${listId}-${selectedIndex}`:undefined}
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
            onSelectionPendingChange?.(true);
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
        <div id={listId} role="listbox" aria-label={placeholder} className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl backdrop-blur-lg divide-y divide-stone-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
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
                  role="option"
                  id={`${listId}-${idx}`}
                  aria-selected={isSelected}
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
