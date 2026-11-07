@echo off
setlocal enabledelayedexpansion

title LG webOS Smart TV Remote - Local Wi-Fi Bridge

echo ====================================================================
echo        LG WEBOS SMART TV REMOTE - LOCAL WI-FI BRIDGE
echo ====================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js (v18 or newer) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

:: 3. Check if frontend build exists
if not exist "dist\" (
    echo [INFO] Building production frontend for LG Remote...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend build failed.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Everything is ready! Starting local bridge server on port 8787...
echo.

call npm run server

pause
