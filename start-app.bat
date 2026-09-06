@echo off
title NRG PH2 HOA & Barangay Portal System
echo ========================================================
echo    NRG PH2 HOA & BARANGAY PORTAL - AUTOMATIC LAUNCHER
echo ========================================================
echo.
echo Starting the application...
echo Backend API : http://localhost:3001
echo Frontend App: http://localhost:5173
echo.

call npm.cmd run dev

pause
