import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEO_CITIES } from '@/lib/seo-cities';
import { calculateDaily } from '@/lib/panchang-server';
import { calculateObservances } from '@/lib/festivals/engine';
import { CALENDAR_DEFAULTS } from '@/lib/calendar-options';
import { civilDate } from '@/lib/astronomy/swiss-server';
import { localNoon } from '@/lib/panchang-query';
import { absoluteUrl } from '@/lib/site-config';
import s from '@/components/Panchang/DiscoveryContent.module.css';

// Compute the local civil date for every request; never serve yesterday at midnight via ISR.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const location = SEO_CITIES.find(city => city.slug === slug);
  if (!location) return {};
  const title = `Today’s Panchang in ${location.name}: Tithi, Sunrise & Rahu Kalam`;
  const description = `Read today’s Hindu Panchang for ${location.name}, ${location.state}: Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, Rahu Kalam, festivals and fasting. Timings use Asia/Kolkata and an explicit sunrise convention.`;
  return { title, description, alternates: { canonical: `/panchang/${slug}` }, openGraph: { title, description, url: `/panchang/${slug}` } };
}
export default async function CityPanchang({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const place = SEO_CITIES.find(city => city.slug === slug);
  if (!place) notFound();
  const now = new Date(), date = civilDate(now, place.timeZone);
  const daily = calculateDaily(place.latitude, place.longitude, localNoon(date, place.timeZone), place.timeZone, CALENDAR_DEFAULTS);
  const observances = calculateObservances(date, date, place.latitude, place.longitude, place.timeZone, CALENDAR_DEFAULTS);
  const time = (value?: string) => value ? new Date(value).toLocaleString('en-IN', { timeZone: place.timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Unavailable';
  const rows = [
    ['Tithi', `${daily.tithi.paksha} ${daily.tithi.name} · until ${time(daily.tithi.end)}`],
    ['Nakshatra', `${daily.nakshatra.name} · until ${time(daily.nakshatra.end)}`],
    ['Yoga', `${daily.yoga.name} · until ${time(daily.yoga.end)}`],
    ['Karana', `${daily.karana.name} · until ${time(daily.karana.end)}`],
    ['Vara', daily.vara.english], ['Sunrise', time(daily.sunrise)], ['Sunset', time(daily.sunset)],
    ['Rahu Kalam', `${time(daily.rahuKalam.start)} – ${time(daily.rahuKalam.end)}`],
    ['Abhijit Muhurta', `${time(daily.abhijitMuhurta.start)} – ${time(daily.abhijitMuhurta.end)}`],
  ];
  const query = new URLSearchParams({ city: place.name, state: place.state || '', country: place.country, lat: String(place.latitude), lon: String(place.longitude), tz: place.timeZone });
  const structuredData = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Hindu Panchang', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: `${place.name} Panchang`, item: absoluteUrl(`/panchang/${slug}`) },
  ] };
  return <main className={s.content}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}/><article className={s.inner}><Link href="/">← Open personal Panchang</Link>
    <h1>Today’s Panchang in {place.name}</h1><p><time dateTime={date}>{new Intl.DateTimeFormat('en-IN', { timeZone: place.timeZone, dateStyle: 'full' }).format(now)}</time> · {place.state}, {place.country} · {place.timeZone}</p>
    <p>Daily Hindu calendar timings for {place.name} ({place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E). The daily elements below are sampled at local sunrise; their ending times include the date.</p>
    <table className={s.table}><caption>Panchang for {place.name} on {date}</caption><tbody>{rows.map(([label,value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
    <Link className={s.action} href={`/?${query}`}>Personalize {place.name} Panchang →</Link>
    <h2>Festivals and fasting today</h2>{observances.length ? observances.map(event => <div key={event.id}><h3>{event.name}{event.status === 'review-required' ? ' · Regional review required' : ''}</h3><p>{event.rule}</p>{event.notes ? <p>{event.notes}</p> : null}{event.parana ? <p>Parana on {event.parana.date}: {event.parana.window ? `${time(event.parana.window.start)} – ${time(event.parana.window.end)}` : event.parana.after ? `after ${time(event.parana.after)}` : 'No reliable window available'}. {event.parana.reason}{event.parana.status === 'review-required' ? ' Regional review required.' : ''}</p> : null}</div>) : <p>No observance is listed for this date in the selected North Indian, Smarta rule set. Other regions and traditions can differ.</p>}

    <h2>How these timings are calculated</h2><p>Swiss Ephemeris with bundled official Sun/Moon files, Lahiri ayanamsa, upper-edge sunrise with standard refraction, zero observer elevation, Purnimanta month naming and Smarta fasting rules. This page uses the North Indian preset for every city; choose your regional calendar in the personal app. The local date is determined on each request; this page does not infer local temple practice.</p>
    {daily.boundaryWarnings?.map(warning => <p key={warning} className={s.note}>{warning}</p>)}
    <h2>Why can another Panchang show different times?</h2><p>Coordinates, elevation, atmospheric assumptions, sunrise convention and regional ritual rules affect results. A transition near sunrise deserves particular care. These are calculated timings and do not carry a zero-error guarantee.</p>
    <nav className={s.links}><Link href="/about">Calculation methodology</Link><Link href="/privacy">Location privacy</Link>{SEO_CITIES.filter(city => city.slug !== slug).map(city => <Link key={city.slug} href={`/panchang/${city.slug}`}>{city.name}</Link>)}</nav>
    <p>Created and owned by <a href="https://arpitagarwala.com">Arpit Agarwala</a>.</p>
  </article></main>;
}
