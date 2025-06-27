@echo off
cls
echo.
echo ===============================================
echo      RAINMAKER ARENA - BOT STATUS CHECK
echo ===============================================
echo.

cd /d "%~dp0"

echo 📊 Checking bot service status...
echo.
npm run bot:status

echo.
echo 📋 Recent bot activity (last 20 lines):
echo.
npm run bot:logs --lines 20

echo.
echo ===============================================
echo.
echo 🛠️  QUICK ACTIONS:
echo   [1] Restart bot     - npm run bot:restart
echo   [2] Stop bot        - npm run bot:stop  
echo   [3] View full logs  - npm run bot:logs
echo.
pause 