'use client';
import { usePathname } from 'next/navigation';
export default function SiteFooter() {
  const path=usePathname();
  if(path==='/'||path==='/jyotish')return null; // These apps have language-aware footers.
  return <footer style={{padding:'20px 24px',textAlign:'center',fontSize:14,background:'#fcfaf5',color:'#514c43',borderTop:'1px solid #ded8cb'}}><a href="https://github.com/arpitagarwala/hindu-panchang">Source code · AGPL</a><p style={{marginTop:12}}>Created and owned by <strong>Arpit Agarwala</strong> · <a href="https://arpitagarwala.com">arpitagarwala.com</a></p></footer>;
}
