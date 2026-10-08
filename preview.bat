@echo off
REM ============================================================
REM  Round Rock PM - preview the website on this Windows PC.
REM  Double-click this file. A browser opens at localhost:8080.
REM  Close the black window to stop the server.
REM ============================================================
setlocal
set PORT=8080
cd /d "%~dp0public"

where py >nul 2>&1
if %errorlevel%==0 (
  echo Starting preview with Python on http://localhost:%PORT%/ ...
  start "" http://localhost:%PORT%/
  py -3 -m http.server %PORT%
  goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
  echo Starting preview with Python on http://localhost:%PORT%/ ...
  start "" http://localhost:%PORT%/
  python -m http.server %PORT%
  goto :eof
)

echo Python was not found - falling back to PowerShell ^(no install needed^).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview.ps1" -Port %PORT%
