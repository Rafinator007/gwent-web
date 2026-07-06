@echo off
chcp 65001 > nul
title GWENT Server Launcher
echo ================================================
echo           GWENT Multiplayer Server
echo ================================================
echo.
echo Starting server...
echo.

cd /d "%~dp0server"

:: Проверяем, установлена ли папка node_modules
if not exist node_modules (
    echo Installing required libraries - npm install...
    echo This might take a minute...
    echo.
    call npm install
)

call npm start

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo ERROR: Failed to start the server.
    echo Please ensure Node.js is installed - https://nodejs.org/
    echo ================================================
    echo.
    pause
)
