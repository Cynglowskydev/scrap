
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { CLAN_NAME, BASE_URL, OUTPUT_DIR, HEADLESS, USE_CHROME_CHANNEL, USER_DATA_DIR, NAV_TIMEOUT_MS, WAIT_TABLE_MS } from './config.js';
import { strip, toInt, parseDate, saveJSON } from './utils.js';

function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

export async function fetchClan(clanName = CLAN_NAME) {
  const url = BASE_URL + encodeURIComponent(clanName);
  const launchOpts = {
    headless: HEADLESS,
    args: ['--disable-blink-features=AutomationControlled']
  };
  if (USE_CHROME_CHANNEL) launchOpts.channel = 'chrome';

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, launchOpts);
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
  page.setDefaultTimeout(NAV_TIMEOUT_MS);

  try {
    console.log(`[i] goto ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Czekaj aż tabela będzie załadowana (lub aż wyzwanie się skończy)
    const started = Date.now();
    let found = false;
    while (Date.now() - started < WAIT_TABLE_MS) {
      const hasTable = await page.$('.squadrons-members__table');
      if (hasTable) { found = true; break; }
      await delay(2000);
    }
    if (!found) {
      // spróbuj jeszcze raz po przeładowaniu
      await page.reload({ waitUntil: 'domcontentloaded' });
      const again = await page.waitForSelector('.squadrons-members__table', { timeout: 30000 }).catch(() => null);
      if (!again) throw new Error('Nie znaleziono tabeli członków (ochrona mogła zablokować).');
    }

    const data = await page.evaluate(() => {
      const strip = (s) => (s || '').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
      const toInt = (x) => {
        x = strip(x).replace(/[^\d.,-]/g,'').replace(',','.');
        const n = parseFloat(x);
        return Number.isFinite(n) ? Math.trunc(n) : 0;
      };
      const parseDate = (d) => {
        const m = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec((d||'').trim());
        return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
      };

      const table = document.querySelector('.squadrons-members__table');
      const items = table ? [...table.querySelectorAll('.squadrons-members__grid-item')] : [];
      const cells = items.slice(6).map(td => strip(td.textContent));

      const rows = [];
      for (let i = 0; i < cells.length; i += 6) {
        const chunk = cells.slice(i, i + 6);
        if (chunk.length < 6) continue;
        let [num, player, rating, activity, role, join] = chunk;
        if (!player) continue;
        rows.push({
          pos: toInt(num) || null,
          nick: player,
          personalRating: toInt(rating),
          activity: toInt(activity),
          role: role || null,
          joinDate: parseDate(join)
        });
      }

      const clanTitle = strip(document.querySelector('.squadrons-info__title')?.textContent);
      return {
        clan: clanTitle || null,
        source: location.href,
        fetchedAt: new Date().toISOString(),
        playersCount: rows.length,
        players: rows
      };
    });

    const saved = saveJSON(OUTPUT_DIR, clanName, data);
    console.log(`[✓] Zapisano ${saved.file}; players: ${data.playersCount}`);
    return data;
  } finally {
    await context.close();
  }
}

// Pozwól uruchomić bezpośrednio: `npm run fetch`
if (process.argv[1] && process.argv[1].endsWith('fetchClan.js')) {
  fetchClan().catch(e => { console.error(e); process.exit(1); });
}
