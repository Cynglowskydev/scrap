
@echo off
setlocal
cd /d "%~dp0\.."
echo [*] Jednorazowy zrzut...
npm install
npm run install:pw
npm run fetch
echo [*] Koniec.
pause
