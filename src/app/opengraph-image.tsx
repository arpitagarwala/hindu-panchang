import { ImageResponse } from 'next/og';
export const alt = 'Panchang — Your daily Hindu calendar, by Arpit Agarwala';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#fcfaf5', color: '#3c2b1e', borderTop: '14px solid #a45b2c' }}><div style={{ fontSize: 28, color: '#99532a', marginBottom: 30 }}>YOUR SACRED EVERYDAY</div><div style={{ fontSize: 100, fontWeight: 700 }}>Panchang</div><div style={{ fontSize: 34, marginTop: 22 }}>Tithi · Muhurta · Festivals · Vrat</div><div style={{ fontSize: 26, color: '#6b6054', marginTop: 42 }}>Your place. Your tradition. By Arpit Agarwala.</div></div>, size);
}
