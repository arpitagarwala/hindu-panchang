import assert from 'node:assert/strict';
import { GITA_VERSES, gitaForDate } from '../src/components/Panchang/gita';
import { nameLabel, monthNameLabel, translator } from '../src/components/Panchang/locale';
import { calculateObservances } from '../src/lib/festivals/engine';
import { calculateDaily } from '../src/lib/panchang-server';
import { CALENDAR_DEFAULTS } from '../src/lib/calendar-options';
import { localNoon } from '../src/lib/panchang-query';
import { tithiAt } from '../src/lib/astronomy/swiss-server';
import { TITHI_NAMES, NAKSHATRA_NAMES, YOGA_NAMES, KARANA_NAMES, HINDU_MONTHS } from '../src/lib/panchang';

for(const name of [...TITHI_NAMES,...NAKSHATRA_NAMES,...YOGA_NAMES,...KARANA_NAMES,...HINDU_MONTHS]) {
  assert.match(nameLabel(name,'hi-IN'),/[\u0900-\u097f]/,`Hindi name: ${name}`);
  assert.equal(nameLabel(name,'en-IN'),name);
}
assert.equal(nameLabel('Rama Ekadashi','hi-IN'),'रमा एकादशी');
assert.equal(nameLabel('Diwali · Lakshmi Puja','hi-IN'),'दीपावली · लक्ष्मी पूजा');
assert.equal(translator('hi-IN')('Settings'),'सेटिंग्स');
assert.equal(monthNameLabel('Shravana','hi-IN'),'श्रावण');
assert.equal(monthNameLabel('Jyeshtha','hi-IN'),'ज्येष्ठ');
assert.equal(new Set(GITA_VERSES.map(v=>`${v.chapter}.${v.verse}`)).size,GITA_VERSES.length);
for(let i=0;i<GITA_VERSES.length;i++) {
  const date=new Date(Date.UTC(2026,10,1+i)).toISOString().slice(0,10);
  const next=new Date(Date.UTC(2026,10,2+i)).toISOString().slice(0,10);
  assert.notEqual(gitaForDate(date),gitaForDate(next),'A fresh verse for consecutive civil dates');
  assert.ok(gitaForDate(date).hi&&gitaForDate(date).en&&gitaForDate(date).sanskrit);
  assert.equal(gitaForDate(date),gitaForDate(date),'Same date gives the same verse');
}
assert.notEqual(gitaForDate('2028-02-29'),gitaForDate('2028-03-01'));
const lat=28.6139,lon=77.209,tz='Asia/Kolkata';
const daily=calculateDaily(lat,lon,localNoon('2026-11-01',tz),tz,CALENDAR_DEFAULTS);
const events=calculateObservances('2026-11-01','2026-11-30',lat,lon,tz,CALENDAR_DEFAULTS);
const ahoi=events.find(e=>e.id.startsWith('ahoi-ashtami-'))!;
assert.ok(ahoi.tithiWindow,'Festival exposes its own tithi interval');
assert.equal(daily.tithi.name,'Saptami','Sunrise tithi differs from evening festival tithi in this case');
assert.equal(tithiAt((Date.parse(ahoi.tithiWindow.start)+Date.parse(ahoi.tithiWindow.end))/2),23,'Ahoi window is Krishna Ashtami, not sunrise Saptami');
for(const event of events)if(event.tithiWindow) {
  assert.ok(Date.parse(event.tithiWindow.end)>Date.parse(event.tithiWindow.start));
  assert.match(nameLabel(event.name,'hi-IN'),/[\u0900-\u097f]/,event.name);
}
console.log('Reading experience checks passed: Hindi astronomical names, festival labels, 36-day verse rotation, leap day, and festival-specific tithi intervals.');
