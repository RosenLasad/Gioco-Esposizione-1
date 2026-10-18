@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0aggiorna_mappe_offline.ps1"
if errorlevel 1 (echo ERRORE: controlla i file JSON. & pause & exit /b 1)
echo Ora puoi aprire index.html offline.
pause
