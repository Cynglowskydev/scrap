
@echo off
setlocal EnableExtensions
cd /d "%~dp0\.."

if not exist logs mkdir logs

echo [*] Sprawdzam Node...
node -v || (
  echo [BŁĄD] Brak Node.js. Pobierz LTS z https://nodejs.org/ i zainstaluj.
  echo.
  pause
  exit /b 1
)

echo [*] npm install...
call npm install || goto :err

echo [*] Playwright Chrome install...
call npm run install:pw || goto :err

echo [*] Start serwera z logami (okno zostanie OTWARTE).
echo     Logi: logs\server.out  oraz logs\server.err
echo.

REM /K = nie zamykaj okna. Przekieruj logi, ale też pokaż je na ekranie (tee-like: using powershell)
set CMD=node src\server.js
set OUT=logs\server.out
set ERR=logs\server.err

REM uruchom w tym samym oknie aby widzieć log na żywo, plus zapis
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/K', '%CMD%' -PassThru; Write-Host 'PID:' $p.Id"

echo.
echo [i] Jeśli okno z serwerem się zamknie, sprawdź pliki logów:
echo     logs\server.out
echo     logs\server.err
echo.
pause
exit /b 0

:err
echo.
echo [BŁĄD] Instalacja lub start nie powiodły się. Zobacz komunikat powyżej.
echo.
pause
exit /b 1
