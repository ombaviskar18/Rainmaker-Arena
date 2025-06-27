@echo off
cls
echo.
echo ===============================================
echo   RAINMAKER ARENA - PERMANENT BOT SERVICE
echo ===============================================
echo.
echo 🚀 Starting Rainmaker Arena Bot as Permanent Service...
echo 🔴 This will keep the bot running 24/7 automatically
echo 💰 Live prices from CoinGecko API
echo 🎯 Automatic round management
echo 📊 Real-time updates
echo.

cd /d "%~dp0"

echo 🛑 Stopping any existing bot instances...
npm run bot:stop >nul 2>&1

echo.
echo 🚀 Starting bot as permanent service...
npm run bot:start

if %errorlevel% neq 0 (
    echo ❌ Failed to start bot service
    echo.
    echo 🔄 Trying alternative method...
    node scripts/telegram-bot-complete.js
    pause
    exit /b 1
)

echo.
echo ✅ Bot started successfully as permanent service!
echo.
echo 📊 Checking bot status...
npm run bot:status

echo.
echo ===============================================
echo   BOT IS NOW RUNNING PERMANENTLY!
echo ===============================================
echo.
echo 🎉 Your Rainmaker Arena bot is now running 24/7!
echo 🔴 It will automatically restart if it crashes
echo 📱 Users can start playing immediately
echo.
echo 🛠️  MANAGEMENT COMMANDS:
echo   - View status: npm run bot:status
echo   - View logs:   npm run bot:logs
echo   - Stop bot:    npm run bot:stop
echo   - Restart bot: npm run bot:restart
echo.
echo 💡 The bot will keep running even if you close this window!
echo 🚀 Go to Telegram and try @Rain_maker_Arena_bot
echo.
pause 