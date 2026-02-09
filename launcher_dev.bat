@echo off
echo Setting up environment for Ryiuk Launcher...
SET "PATH=%PATH%;%USERPROFILE%\.cargo\bin"
echo Cargo path added.
echo Starting Tauri Dev...
npm run tauri dev
pause
