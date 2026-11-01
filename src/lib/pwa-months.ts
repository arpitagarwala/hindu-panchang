import type { PanchangResult } from './panchang';
import { createOfflineReading, type ReadingContext, type OfflineReading } from './pwa-readings';

export const OFFLINE_MONTH_KEY='panchang.offline-months.v1';
export const OFFLINE_MONTH_LIMIT=3;
export type OfflineMonth={schema:1;key:string;month:string;savedAt:string;city:OfflineReading['city'];convention:string;readings:OfflineReading[]};
export type MonthContext=Omit<ReadingContext,'date'> & {month:string};
export function monthDates(month:string) {
  if(!/^\d{4}-\d{2}$/.test(month)||month<'1900-01'||month>'2100-12'||Number(month.slice(5))<1||Number(month.slice(5))>12)throw new Error('Invalid offline month.');
  return Array.from({length:new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate()},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`);
}
export function offlineMonthIdentity(context:MonthContext) {
  return [context.month,context.latitude,context.longitude,context.timeZone,context.region,context.monthConvention,context.tradition,context.sunriseConvention].join('|');
}
export function createOfflineMonth(days:PanchangResult[],context:MonthContext):OfflineMonth {
  const dates=monthDates(context.month);
  if(!Array.isArray(days)||days.length!==dates.length)throw new Error('The month download is incomplete. Nothing was saved.');
  const readings=dates.map((date,i)=>{
    const day=days[i];
    if(!day?.tithi?.start||!day.tithi.end||!day.nakshatra?.end||!day.yoga?.end||!day.karana?.end)throw new Error('Detailed daily transitions are missing. Nothing was saved.');
    return createOfflineReading(day,{...context,date});
  });
  return {schema:1,key:offlineMonthIdentity(context),month:context.month,savedAt:new Date().toISOString(),city:readings[0].city,convention:readings[0].convention,readings};
}
export function readOfflineMonths(storage:Pick<Storage,'getItem'>):OfflineMonth[] {
  try{const value=JSON.parse(storage.getItem(OFFLINE_MONTH_KEY)||'[]');return Array.isArray(value)?value.filter(pack=>pack?.schema===1&&typeof pack.key==='string'&&Array.isArray(pack.readings)).slice(0,OFFLINE_MONTH_LIMIT):[];}catch{return [];}
}
export function saveOfflineMonth(pack:OfflineMonth,storage:Pick<Storage,'getItem'|'setItem'>) {
  // One write after complete validation; a failed download or quota error never
  // truncates an existing month or pushes its days through the 20-recent-day limit.
  const next=[pack,...readOfflineMonths(storage).filter(item=>item.key!==pack.key)].slice(0,OFFLINE_MONTH_LIMIT);
  storage.setItem(OFFLINE_MONTH_KEY,JSON.stringify(next));
}
export async function downloadOfflineMonth(context:MonthContext,signal:AbortSignal,fetcher:typeof fetch=fetch) {
  signal.throwIfAborted();
  const [year,month]=context.month.split('-');monthDates(context.month);
  const params=new URLSearchParams({year,month,lat:String(context.latitude),lon:String(context.longitude),tz:context.timeZone,region:context.region,months:context.monthConvention,tradition:context.tradition,sunrise:context.sunriseConvention,detailed:'1'});
  const response=await fetcher(`/api/panchang-month?${params}`,{signal,cache:'no-store'});
  if(!response.ok)throw new Error('The month could not be downloaded. Please reconnect and try again.');
  const days=await response.json();signal.throwIfAborted();
  return createOfflineMonth(days,context);
}
