
@echo off
setlocal
cd /d "%~dp0\.."
echo [*] Instaluję zależności...
npm install
echo [*] Instaluję Chrome dla Playwright...
npm run install:pw
echo [*] Uruchamiam serwer (CTRL+C aby zatrzymać)...
node src\server.js
pause
