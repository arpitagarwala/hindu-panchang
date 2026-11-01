import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const EPHEMERIS_FILES = [
  { name: 'sepl_18.se1', sha256: 'ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66' },
  { name: 'semo_18.se1', sha256: '1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7' },
] as const;
export function verifyEphemerisData(data: Partial<Record<string, Buffer>>) {
  for (const file of EPHEMERIS_FILES) {
    const contents = data[file.name];
    if (!contents) throw new Error(`Required ephemeris file is missing or unreadable: ${file.name}`);
    const digest = createHash('sha256').update(contents).digest('hex');
    if (digest !== file.sha256) throw new Error(`Ephemeris integrity check failed: ${file.name}`);
  }
  return { verified: true, algorithm: 'SHA-256', files: EPHEMERIS_FILES.map(file => file.name) };
}

/** Fixed paths keep deployment tracing limited to ephemeris data. No downloads or fallback. */
export function verifyEphemerisFiles() {
  try {
    return verifyEphemerisData({
      'sepl_18.se1': readFileSync(path.join(process.cwd(), 'data', 'ephemeris', 'sepl_18.se1')),
      'semo_18.se1': readFileSync(path.join(process.cwd(), 'data', 'ephemeris', 'semo_18.se1')),
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error) throw new Error('Required ephemeris files are missing or unreadable.');
    throw error;
  }
}

let verified = false;
export function ensureEphemerisIntegrity() {
  if (!verified) { verifyEphemerisFiles(); verified = true; }
}
