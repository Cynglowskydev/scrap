
export const CLAN_NAME = "Pancerna Republika Lufowa"; // dokładnie jak na stronie
export const LANG = "en";
export const BASE_URL = `https://warthunder.com/${LANG}/community/claninfo/`;
export const OUTPUT_DIR = new URL('../data/', import.meta.url);
export const PORT = 3333;

// Ustawienia przeglądarki
export const HEADLESS = true;              // jeśli problem z wyzwaniem -> ustaw false
export const USE_CHROME_CHANNEL = true;    // użyj zainstalowanego Chrome'a
export const USER_DATA_DIR = "../.profile"; // persistent profile (cookies itp.)
export const NAV_TIMEOUT_MS = 120000;
export const WAIT_TABLE_MS = 90000;        // ile maks. czekamy na tabelę
