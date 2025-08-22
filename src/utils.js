
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function strip(s) {
  return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function toInt(s) {
  s = strip(s).replace(/[^\d.,-]/g,'').replace(',','.');
  if (!s) return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function parseDate(d) {
  const m = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec((d||'').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

export function safeName(name) {
  return (name || 'clan').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g,'');
}

export function outPath(dirURL, filename) {
  const __dirname = path.dirname(fileURLToPath(dirURL));
  return path.join(__dirname, filename);
}

export function saveJSON(dirURL, clan, data) {
  const name = safeName(clan);
  const file = outPath(dirURL, `roster_${name}.json`);
  const latest = outPath(dirURL, `latest.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(latest, JSON.stringify(data, null, 2), 'utf8');
  return { file, latest };
}
