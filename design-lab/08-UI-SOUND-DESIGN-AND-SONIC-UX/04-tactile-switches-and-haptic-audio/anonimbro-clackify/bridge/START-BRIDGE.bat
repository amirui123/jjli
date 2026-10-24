@echo off
title CLACKIFY — EXTERNAL HOOK BRIDGE
cd /d "%~dp0"

echo.
echo   CLACKIFY EXTERNAL HOOK BRIDGE
echo   ---------------------------------------------
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo   [X] Python tidak ditemukan di PATH.
  echo       Install Python 3 dari python.org ^(centang "Add to PATH"^),
  echo       lalu jalankan lagi file ini.
  echo.
  pause
  exit /b 1
)

python -u clack-bridge.py %*
echo.
echo   [BRIDGE] berhenti. Tekan tombol apa saja untuk menutup jendela ini.
pause >nul
