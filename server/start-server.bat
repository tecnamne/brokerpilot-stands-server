@echo off
title Stands Manager Server
cd /d "%~dp0"
echo ========================================
echo    Stands Manager Server
echo ========================================
echo.
echo Server starting on port 3001...
echo Your computer: %computername%
echo.
echo Finding your IP addresses:
ipconfig | findstr "IPv4"
echo.
echo Share this IP with your team members!
echo They need to update popup.js with your IP address.
echo.
echo Press Ctrl+C to stop server
echo ========================================
echo.
json-server --watch stands.json --port 3001 --host 0.0.0.0
pause
