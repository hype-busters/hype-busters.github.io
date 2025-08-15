@echo off
echo Starting local development server...
echo.
echo The survey will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP server...
    python -m http.server 8000
) else (
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js HTTP server...
        npx http-server -p 8000 --cors
    ) else (
        echo.
        echo ERROR: Neither Python nor Node.js found!
        echo Please install one of the following:
        echo - Python: https://python.org/downloads/
        echo - Node.js: https://nodejs.org/
        echo.
        echo Or use the embedded questions option.
        pause
    )
)
