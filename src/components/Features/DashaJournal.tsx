'use client';

import React, { useState, useEffect } from 'react';
import { VimshottariResult } from '@/lib/astronomy/dasha';
import { LanguageCode, TRANSLATIONS } from '@/lib/i18n/translations';
import { formatDateFormatted } from '@/lib/utils/format';
import { BookOpen, Plus, Trash2, Tag, Calendar, Sparkles, Heart, Briefcase, Plane, Activity } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  category: 'Career' | 'Relationship' | 'Relocation' | 'Health' | 'Spiritual' | 'Financial';
  dashaTag: string; // e.g. "Jupiter / Saturn"
  notes: string;
  createdAt: string;
}

interface DashaJournalProps {
  dasha: VimshottariResult;
  language: LanguageCode;
}

const CATEGORY_ICONS: Record<string, typeof Briefcase> = {
  Career: Briefcase,
  Relationship: Heart,
  Relocation: Plane,
  Health: Activity,
  Spiritual: Sparkles,
  Financial: Tag,
};

export default function DashaJournal({ dasha, language }: DashaJournalProps) {
  const t = TRANSLATIONS[language];
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<JournalEntry['category']>('Career');
  const [notes, setNotes] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jyotish_dasha_journal');
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        // Initial sample entry
        const sample: JournalEntry[] = [
          {
            id: 'sample-1',
            date: '2023-04-15',
            title: 'Promotion to Lead Architect',
            category: 'Career',
            dashaTag: `${dasha.currentDasha.mahadasha.planet} / ${dasha.currentDasha.antardasha.planet}`,
            notes: 'Took on leadership responsibility for core systems during an ambitious expansion cycle.',
            createdAt: new Date().toISOString(),
          },
        ];
        setEntries(sample);
        localStorage.setItem('jyotish_dasha_journal', JSON.stringify(sample));
      }
    } catch (e) {
      console.error(e);
    }
  }, [dasha]);

  const saveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Tag with active dasha period
    const dashaTag = `${dasha.currentDasha.mahadasha.planet} / ${dasha.currentDasha.antardasha.planet}`;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: eventDate,
      title,
      category,
      dashaTag,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('jyotish_dasha_journal', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setNotes('');
    setShowModal(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem('jyotish_dasha_journal', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              TIMELINE REFLECTION LOG
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">{t.journal.title}</h2>
          <p className="text-xs text-stone-400 max-w-xl">
            Log real milestones (career shifts, moves, relationships) against your active Dasha period for personal reflection.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.journal.newEntry}
        </button>
      </div>

      {/* Timeline Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-900/60 border border-stone-800 text-stone-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
            <p className="text-sm font-medium">No journal entries logged yet.</p>
            <p className="text-xs text-stone-500 mt-1">Add your first life event to link it with your cosmic timeline.</p>
          </div>
        ) : (
          entries.map((entry) => {
            const Icon = CATEGORY_ICONS[entry.category] || Sparkles;
            return (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/30 transition-all shadow-md space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-stone-100">{entry.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          {formatDateFormatted(entry.date)}
                        </span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{entry.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                      Dasha: {entry.dashaTag}
                    </span>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs text-stone-300 pl-11 pt-1 leading-relaxed">{entry.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-100">{t.journal.newEntry}</h3>

            <form onSubmit={saveEntry} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 block mb-1 font-medium">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Launched new venture / Shifted to New City"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1 font-medium">{t.journal.eventDate}</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1 font-medium">{t.journal.eventCategory}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as JournalEntry['category'])}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Career">Career & Business</option>
                    <option value="Relationship">Relationship & Family</option>
                    <option value="Relocation">Relocation & Travel</option>
                    <option value="Health">Health & Wellness</option>
                    <option value="Spiritual">Spiritual Awakening</option>
                    <option value="Financial">Financial Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-medium">{t.journal.notes}</label>
                <textarea
                  rows={3}
                  placeholder="Reflections, lessons learned, or details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  {t.journal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
