import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
const svg=await readFile('src/app/icon.svg','utf8');
await mkdir('public/pwa',{recursive:true});
for(const size of [192,512,180]) {
  await sharp(Buffer.from(svg)).resize(size,size).flatten({background:'#fbefe3'}).png().toFile(`public/pwa/${size===180?'apple-touch-icon.png':`icon-${size}.png`}`);
}
await sharp(Buffer.from(svg.replace('rx="16"','rx="0"'))).resize(512,512).flatten({background:'#fbefe3'}).png().toFile('public/pwa/maskable-512.png');
