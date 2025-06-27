@echo off
cls
echo.
echo ===============================================
echo    RAINMAKER ARENA - AUTO TELEGRAM BOT
echo ===============================================
echo.
echo 🚀 Starting Rainmaker Arena Telegram Bot...
echo 🔴 This bot will auto-start and require NO manual intervention
echo 💰 Live prices from CoinGecko API
echo 🎯 Automatic round management
echo 📊 Real-time updates
echo.
echo Bot will be ready in 10-15 seconds...
echo.

cd /d "%~dp0"
node scripts/telegram-bot-complete.js

echo.
echo Bot has stopped. Press any key to restart...
pause >nul
goto :start 