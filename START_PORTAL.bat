@echo off
setlocal enabledelayedexpansion
title NRG PH2 HOA & Barangay Portal System
color 0A

echo ===============================================================================
echo     NORTHRIDGE GROVE PHASE 2 HOA & BARANGAY 174 SMART COMMUNITY PORTAL
echo                           AUTOMATIC STARTUP LAUNCHER
echo ===============================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please download and install Node.js LTS from: https://nodejs.org/
    echo Once installed, restart this file.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js detected: %NODE_VER%

:: 2. Check if dependencies are installed
if not exist "node_modules\" (
    echo.
    echo [SETUP] Root dependencies missing. Installing packages, please wait...
    call npm.cmd run install:all
) else if not exist "client\node_modules\" (
    echo.
    echo [SETUP] Client dependencies missing. Installing packages, please wait...
    call npm.cmd run install:all
) else if not exist "server\node_modules\" (
    echo.
    echo [SETUP] Server dependencies missing. Installing packages, please wait...
    call npm.cmd run install:all
)

echo [OK] Dependencies verified.
echo.
echo ===============================================================================
echo   Starting Local Development Services...
echo   - Backend Server : http://localhost:3001
echo   - Frontend Portal: http://localhost:5173
echo.
echo   Press [Ctrl + C] anytime in this window to stop both servers.
echo ===============================================================================
echo.

:: 3. Launch browser in the background after 3 seconds
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: 4. Start servers concurrently
call npm.cmd run dev

pause
