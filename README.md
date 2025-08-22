
# WT Playwright Scraper (auto)

Automatyczny serwis, który **co 30 minut** pobiera skład klanu z:
`https://warthunder.com/en/community/claninfo/<NAZWA>`
i zapisuje JSON w `data/`. Udostępnia też proste API HTTP.

## Wymagania
- Windows lub Linux
- Node.js 18+ (LTS)
- Chrome dla Playwrighta: `npm run install:pw` (zainstaluje kanał `chrome`)

## Szybki start (Windows)
1) Zainstaluj Node.js LTS: https://nodejs.org/en/download
2) Otwórz CMD w tym folderze i wykonaj:
```
npm install
npm run install:pw
npm start
```
3) Wejdź na: `http://localhost:3333/api/roster` — dostaniesz ostatni JSON.
   Ręczny refresh: `http://localhost:3333/api/refresh`

## Zmiana klanu
- Edytuj `src/config.js`, pole `CLAN_NAME` (pełna nazwa jak na stronie).
- Domyślnie: "Pancerna Republika Lufowa".

## Harmonogram (wbudowany)
- `node-cron` uruchamia pobieranie co 30 minut.
- Pliki trafiają do `data/roster_<nazwa>.json` oraz `data/latest.json`.

## Uwaga dot. ochrony (Cloudflare)
- Używamy **Playwright + Chrome (channel: 'chrome')** i **profilu persistent**,
  co zwykle przechodzi "Managed Challenge".
- Jeśli ochrona zaostrzy się na headless, ustaw w `config.js` -> `HEADLESS=false`.

## Windows: automatyczny start
- Możesz dodać skrót do `node src/server.js` w Autostarcie,
  albo użyć Harmonogramu zadań i odpalać `scripts\start_server.bat`.
