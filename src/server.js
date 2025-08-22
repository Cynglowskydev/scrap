
import express from 'express';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fetchClan } from './fetchClan.js';
import { PORT, OUTPUT_DIR, CLAN_NAME } from './config.js';
import { outPath } from './utils.js';

// Hardening: don't crash on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), clan: CLAN_NAME });
});

app.get('/api/roster', (req, res) => {
  try {
    const latest = outPath(OUTPUT_DIR, 'latest.json');
    if (!fs.existsSync(latest)) return res.status(404).json({ ok:false, error:'Brak pliku latest.json' });
    const data = JSON.parse(fs.readFileSync(latest, 'utf8'));
    res.json({ ok:true, data });
  } catch (e) {
    console.error('[api/roster] error', e);
    res.status(500).json({ ok:false, error: String(e) });
  }
});

let refreshing = false;
app.post('/api/refresh', async (req, res) => {
  if (refreshing) return res.status(429).json({ ok:false, error:'Już trwa odświeżanie' });
  refreshing = true;
  try {
    const clan = (req.body && req.body.clan) || CLAN_NAME;
    const data = await fetchClan(clan);
    res.json({ ok:true, players: data.playersCount, fetchedAt: data.fetchedAt });
  } catch (e) {
    console.error('[api/refresh] error', e);
    res.status(500).json({ ok:false, error: String(e) });
  } finally {
    refreshing = false;
  }
});

// Cron co 30 minut
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('[cron] refresh start');
    await fetchClan(CLAN_NAME);
    console.log('[cron] refresh done');
  } catch (e) {
    console.error('[cron] error', e);
  }
}, { scheduled: true });

app.listen(PORT, () => {
  console.log(`[i] Server listening on http://localhost:${PORT}`);
  console.log(`[i] GET  /api/health`);
  console.log(`[i] GET  /api/roster`);
  console.log(`[i] POST /api/refresh`);
});
