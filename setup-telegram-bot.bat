@echo off
echo 🚀 Setting up Rainmaker Arena Telegram Bot...
echo.
echo ⚠️  SECURITY WARNING: This script creates a template .env file
echo ⚠️  You MUST replace placeholder values with your actual credentials
echo ⚠️  NEVER commit real credentials to version control!
echo.

echo 📝 Creating .env file template...

(
echo # Rainmaker Arena Environment Configuration
echo # ⚠️  SECURITY WARNING: Replace ALL placeholder values with your actual credentials
echo # ⚠️  NEVER commit this file to version control after adding real credentials
echo.
echo # Core Application
echo NODE_ENV=development
echo PROJECT_NAME=rainmaker_arena
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo.
echo # === TELEGRAM BOT (⚠️  REPLACE WITH YOUR ACTUAL VALUES) ===
echo # Get these from @BotFather on Telegram
echo TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
echo TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
echo TELEGRAM_BOT_USERNAME=@your_bot_username
echo.
echo # === COINGECKO API (⚠️  REPLACE WITH YOUR ACTUAL KEY) ===
echo # Get free API key from https://coingecko.com/en/api
echo COINGECKO_API_KEY=YOUR_COINGECKO_API_KEY_HERE
echo.
echo # === WALLET CONNECTION ===
echo NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
echo.
echo # === ETHEREUM RPC ===
echo ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_key_here
echo.
echo # === CHAINLINK PRICE FEEDS ===
echo CHAINLINK_BTC_USD_FEED=0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
echo CHAINLINK_ETH_USD_FEED=0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
echo CHAINLINK_LINK_USD_FEED=0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c
echo CHAINLINK_MATIC_USD_FEED=0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676
echo CHAINLINK_UNI_USD_FEED=0x553303d460EE0afB37EdFf9bE42922D8FF63220e
echo.
echo # === CDP WALLET (for real ETH rewards) ===
echo CDP_API_KEY_NAME=your_cdp_api_key_name_here
echo CDP_PRIVATE_KEY=your_cdp_private_key_here
echo.
echo # === DATABASE ===
echo DATABASE_URL=postgresql://username:password@localhost:5432/rainmaker_arena
echo.
echo # === SECURITY ===
echo JWT_SECRET=your_random_32_character_secret_key_here
) > .env

echo ✅ .env template file created successfully!
echo.
echo ⚠️  IMPORTANT SECURITY STEPS:
echo 1. Open .env file in a text editor
echo 2. Replace ALL placeholder values with your actual credentials
echo 3. NEVER share your .env file publicly
echo 4. Ensure .env is in .gitignore
echo.
echo 📱 NEXT STEPS:
echo 1. Get bot token from @BotFather on Telegram
echo 2. Get CoinGecko API key from https://coingecko.com/en/api
echo 3. Add your credentials to the .env file
echo 4. Run: npm run bot:start
echo.
pause 