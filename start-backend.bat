@echo off
echo Starting Backend Server...
echo.

cd /d "%~dp0"

echo Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with required variables.
    pause
    exit /b 1
)

echo.
echo Starting server...
npm run dev:server

pause
