import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = ['public/offline.html', 'public/pwa/offline.js', 'public/pwa/icon-192.png', 'public/pwa/icon-512.png', 'public/pwa/maskable-512.png', 'public/pwa/apple-touch-icon.png'];
const template = await readFile('scripts/pwa-worker.template.js', 'utf8');
const hash = createHash('sha256').update(template);
for (const file of assets) hash.update(await readFile(file));
const version = hash.digest('hex').slice(0, 16);
await writeFile('public/sw.js', template.replace('__PWA_VERSION__', version));
console.log(`PWA offline assets version: ${version}`);
