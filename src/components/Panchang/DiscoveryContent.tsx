import Link from 'next/link';
import { SEO_CITIES } from '@/lib/seo-cities';
import s from './DiscoveryContent.module.css';

export default function DiscoveryContent() {
  return <section className={s.content} aria-label="Explore Hindu Panchang"><div className={s.inner}>
    <h2>A Hindu Panchang for your place and tradition</h2>
    <p>Read the five daily elements—Tithi, Nakshatra, Yoga, Karana and Vara—alongside sunrise, sunset, Rahu Kalam, Choghadiya and Muhurta. Choose a date, location and regional convention to explore festivals, fasting dates and available parana windows.</p>
    <h3>Today’s Panchang by city</h3><nav className={s.links} aria-label="City Panchang pages">{SEO_CITIES.map(city => <Link key={city.slug} href={`/panchang/${city.slug}`}>{city.name} Panchang</Link>)}</nav>
    <div className={s.columns}><div><h3>Why does location matter?</h3><p>Sunrise and sunset depend on where you are. A tithi ending close to sunrise can change a fasting date. Device location detection uses your permission; you can also search for a city or enter coordinates.</p></div><div><h3>Which calendar should I choose?</h3><p>Choose your regional calendar, Amanta or Purnimanta month naming, Smarta or common Vaishnava fasting rules, and sunrise convention. Entries needing regional review are labeled.</p></div></div>
    <nav className={s.links} aria-label="About this Panchang"><Link href="/about">Calculations, sources & limitations</Link><Link href="/privacy">Location & privacy</Link><a href="https://github.com/arpitagarwala/hindu-panchang">Source code · AGPL</a><a href="https://arpitagarwala.com">About Arpit Agarwala</a></nav>
  </div></section>;
}
