import type { Observance } from '../observance-types';

export function escapeCalendarText(text:string) { return text.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,'); }
// RFC 5545 content lines are folded at 75 octets, without splitting UTF-8 characters.
export function foldCalendarLine(line:string) {
  const encoder=new TextEncoder();let output='',part='',size=0;
  for(const character of line){const bytes=encoder.encode(character).length;if(size+bytes>75){output+=part+'\r\n';part=' ';size=1;}part+=character;size+=bytes;}
  return output+part;
}
function stamp(instant:string|Date) { const date=new Date(instant);if(!Number.isFinite(date.getTime()))throw new Error('Invalid calendar timestamp.');return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); }
function calendarDate(date:string) { if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(`${date}T12:00:00Z`).toISOString().slice(0,10)!==date)throw new Error('Invalid calendar date.');return date.replaceAll('-',''); }
function nextDate(date:string) { return new Date(Date.parse(`${date}T12:00:00Z`)+86400000).toISOString().slice(0,10); }
export function buildObservanceCalendar(events:Observance[],location:string,timeZone:string,createdAt=new Date()):string {
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Arpit Agarwala//Panchang//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${escapeCalendarText(`Panchang · ${location}`)}`];
  for(const event of events){
    const review=event.status==='review-required'?'[Regional review] ':'';
    const detail=[event.rule,event.notes,`Location: ${location}. Times calculated for ${timeZone}.`,event.source].filter(Boolean).join('\n');
    const uid=encodeURIComponent(`${event.id}-${location}-${timeZone}`);
    lines.push('BEGIN:VEVENT',`UID:${uid}@panchang.local`,`DTSTAMP:${stamp(createdAt)}`,`DTSTART;VALUE=DATE:${calendarDate(event.date)}`,`DTEND;VALUE=DATE:${calendarDate(nextDate(event.date))}`,`SUMMARY:${escapeCalendarText(review+event.name)}`,`DESCRIPTION:${escapeCalendarText(detail)}`,`LOCATION:${escapeCalendarText(location)}`,'TRANSP:TRANSPARENT','END:VEVENT');
    const start=event.parana?.window?.start||event.parana?.after;
    if(start&&event.parana){const end=event.parana.window?.end;if(end&&Date.parse(end)<=Date.parse(start))throw new Error('Parana end must follow its start.');lines.push('BEGIN:VEVENT',`UID:parana-${uid}@panchang.local`,`DTSTAMP:${stamp(createdAt)}`,`DTSTART:${stamp(start)}`,...(end?[`DTEND:${stamp(end)}`]:[]),`SUMMARY:${escapeCalendarText(`${review}${event.name} · ${event.parana.after?'Parana after moonrise':'Parana'}`)}`,`DESCRIPTION:${escapeCalendarText(`${event.parana.reason}\n${detail}`)}`,`LOCATION:${escapeCalendarText(location)}`,'TRANSP:TRANSPARENT','END:VEVENT');}
  }
  lines.push('END:VCALENDAR');return lines.map(foldCalendarLine).join('\r\n')+'\r\n';
}
