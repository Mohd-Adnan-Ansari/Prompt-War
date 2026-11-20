@echo off
setlocal enabledelayedexpansion
title CrisisAI System Launcher

echo ====================================================================
echo            CRISISAI - MULTI-AGENT CRISIS COMMAND CENTRE
echo                          System Launcher
echo ====================================================================
echo.

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: --------------------------------------------------------------------
:: 1. Pre-flight Environment Checks
:: --------------------------------------------------------------------
echo [1/4] Performing pre-flight environment checks...

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python was not found in your system PATH.
    echo         Please ensure Python 3.10+ is installed and added to PATH.
    echo.
    pause
    exit /b 1
)

where npm.cmd >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm.cmd was not found in your system PATH.
    echo         Please ensure Node.js is installed.
    echo.
    pause
    exit /b 1
)

if not exist "%PROJECT_DIR%backend" (
    echo [ERROR] Backend folder not found at %PROJECT_DIR%backend.
    echo.
    pause
    exit /b 1
)

if not exist "%PROJECT_DIR%frontend" (
    echo [ERROR] Frontend folder not found at %PROJECT_DIR%frontend.
    echo.
    pause
    exit /b 1
)

echo [OK] Python, npm.cmd, and project directories verified.
echo.

:: --------------------------------------------------------------------
:: 2. Check Ports and Start Backend (FastAPI on Port 8000)
:: --------------------------------------------------------------------
echo [2/4] Checking Port 8000 for FastAPI Backend Server...

netstat -ano | findstr ":8000" | findstr /I "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Port 8000 is already in use. Existing FastAPI backend detected.
) else (
    echo [INFO] Launching FastAPI backend in a separate terminal...
    start "CrisisAI - Backend Server (FastAPI)" /D "%PROJECT_DIR%backend" cmd /k "title CrisisAI Backend Server && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
)
echo.

:: --------------------------------------------------------------------
:: 3. Check Ports and Start Frontend (React/Vite on Port 5173)
:: --------------------------------------------------------------------
echo [3/4] Checking Port 5173 for React/Vite Frontend Server...

netstat -ano | findstr ":5173" | findstr /I "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Port 5173 is already in use. Existing Frontend server detected.
) else (
    echo [INFO] Launching React/Vite frontend in a separate terminal using npm.cmd...
    start "CrisisAI - Frontend Server (React/Vite)" /D "%PROJECT_DIR%frontend" cmd /k "title CrisisAI Frontend Web Server && npm.cmd run dev"
)
echo.

:: --------------------------------------------------------------------
:: 4. Verify Server Readiness & Health Checks
:: --------------------------------------------------------------------
echo [4/4] Verifying server health and waiting for readiness...

set "BACKEND_READY=0"
set "FRONTEND_READY=0"
set "WAIT_ATTEMPTS=0"
set "MAX_ATTEMPTS=25"

:WAIT_LOOP
set /a WAIT_ATTEMPTS+=1

:: Probe Backend
if !BACKEND_READY! EQU 0 (
    curl.exe -s -o nul --connect-timeout 1 http://127.0.0.1:8000/api/health >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "BACKEND_READY=1"
        echo   [OK] FastAPI Backend is live at http://127.0.0.1:8000
    )
)

:: Probe Frontend
if !FRONTEND_READY! EQU 0 (
    curl.exe -s -o nul --connect-timeout 1 http://localhost:5173 >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "FRONTEND_READY=1"
        echo   [OK] React/Vite Frontend is live at http://localhost:5173
    )
)

if !BACKEND_READY! EQU 1 (
    if !FRONTEND_READY! EQU 1 (
        goto SERVERS_READY
    )
)

if !WAIT_ATTEMPTS! GEQ !MAX_ATTEMPTS! (
    goto TIMEOUT_WARNING
)

ping -n 2 127.0.0.1 >nul 2>&1
goto WAIT_LOOP

:TIMEOUT_WARNING
echo.
if !BACKEND_READY! EQU 0 (
    echo [WARNING] FastAPI backend on port 8000 did not respond within 25 seconds.
    echo           Please check the 'CrisisAI - Backend Server' window for error details.
)
if !FRONTEND_READY! EQU 0 (
    echo [WARNING] React frontend on port 5173 did not respond within 25 seconds.
    echo           Please check the 'CrisisAI - Frontend Server' window for error details.
)
goto OPEN_BROWSER

:SERVERS_READY
echo.
echo ====================================================================
echo  [SUCCESS] All CrisisAI command systems are live and operational!
echo    - Frontend Portal:  http://localhost:5173
echo    - Backend API Docs: http://127.0.0.1:8000/docs
echo ====================================================================

:OPEN_BROWSER
echo.
echo [INFO] Launching Google Chrome at http://localhost:5173 ...

set "CHROME_EXE="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME_EXE (
    start "" "%CHROME_EXE%" "http://localhost:5173"
) else (
    echo [NOTICE] Google Chrome not found at standard path. Launching default browser...
    start http://localhost:5173
)

echo.
echo ====================================================================
echo  CrisisAI is running in the background.
echo  Keep the backend and frontend terminal windows open while in use.
echo  To shut down, simply close both terminal windows.
echo ====================================================================
echo.
ping -n 4 127.0.0.1 >nul 2>&1
exit /b 0
