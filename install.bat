@echo off
title Installing HOA & Barangay Portal Dependencies
echo ========================================================
echo    INSTALLING DEPENDENCIES - PLEASE WAIT A MOMENT
echo ========================================================
echo.

call npm.cmd run install:all

echo.
echo ========================================================
echo    INSTALLATION COMPLETE! YOU CAN NOW RUN start-app.bat
echo ========================================================
echo.
pause
