@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 (
  start "Obito - servidor local" /D "%~dp0" py -m http.server 8765
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo No se encontro Python. Instala Python o usa la extension Live Server de VS Code.
    pause
    exit /b 1
  )
  start "Obito - servidor local" /D "%~dp0" python -m http.server 8765
)

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/"
