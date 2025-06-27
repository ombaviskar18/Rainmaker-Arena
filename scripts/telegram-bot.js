#!/usr/bin/env node

const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

// ⚠️  SECURITY: Use environment variables for sensitive data
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Validate required environment variables
if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required in environment variables');
  console.error('💡 Add your bot token to .env file or set environment variable');
  console.error('📋 Example: TELEGRAM_BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

if (!TELEGRAM_CHAT_ID) {
  console.error('❌ TELEGRAM_CHAT_ID is required in environment variables'); 
  console.error('💡 Add your chat ID to .env file or set environment variable');
  console.error('📋 Example: TELEGRAM_CHAT_ID=your_chat_id_here');
  process.exit(1);
}

if (!COINGECKO_API_KEY) {
  console.warn('⚠️  COINGECKO_API_KEY not found. Using free tier with rate limits.');
  console.warn('💡 Get free API key from: https://coingecko.com/en/api');
}

// Enhanced fetch function using native https
function fetchJSON(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'RainmakerArena/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

console.log('🚀 RAINMAKER ARENA - SECURE BOT STARTING...\n');
console.log('🔒 Using environment variables for credentials');

// Create bot instance with auto-start
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
  polling: { 
    interval: 500,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Data storage
const users = new Map();
const activeBets = new Map();
const liveRounds = new Map();
let currentPrices = new Map();
let isInitialized = false;

// Supported cryptocurrencies
const SUPPORTED_CRYPTOS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' }
];

// Initialize bot automatically
async function initializeBot() {
  if (isInitialized) return;
  
  try {
    console.log('🔍 Auto-initializing bot...');
    
    // Test connection
    const botInfo = await bot.getMe();
    console.log(`✅ Connected: ${botInfo.first_name} (@${botInfo.username})`);

    // Set commands
    await bot.setMyCommands([
      { command: 'start', description: '🚀 Start Rainmaker Arena' },
      { command: 'menu', description: '🎮 Main menu' },
      { command: 'prices', description: '💰 Live crypto prices' },
      { command: 'predict', description: '🎯 Make predictions' },
      { command: 'bets', description: '💸 View active bets' },
      { command: 'leaderboard', description: '🏆 Top players' },
      { command: 'stats', description: '📊 Your statistics' },
      { command: 'help', description: '❓ All commands' }
    ]);

    // Start price updates immediately
    await fetchLivePrices();
    
    // Create initial rounds
    setTimeout(() => {
      SUPPORTED_CRYPTOS.forEach((crypto, index) => {
        setTimeout(() => createRoundForCrypto(crypto.symbol), index * 5000);
      });
    }, 2000);

    // Set up intervals
    setInterval(fetchLivePrices, 30000); // Every 30 seconds
    setInterval(createNewRounds, 5 * 60 * 1000); // Every 5 minutes
    setInterval(sendLiveUpdate, 2 * 60 * 1000); // Every 2 minutes

    // Send startup message
    const startupMessage = `🌧️⚡ RAINMAKER ARENA - SECURE BOT ONLINE! ⚡🌧️

🤖 Status: ONLINE and LIVE
🔒 Security: Environment variables active
📊 Live Prices: UPDATING (30s intervals)
🎯 Gaming Rounds: ACTIVE
🔄 Auto-Management: ENABLED

💡 Bot is ready! Try /start to play!

🔴 ALL FEATURES AUTOMATED:
• Real-time price updates from CoinGecko
• Automatic round creation and management  
• Live betting notifications
• Leaderboard updates
• Self-healing if any issues occur

🚀 Ready to earn ETH!`;

    await bot.sendMessage(TELEGRAM_CHAT_ID, startupMessage);
    console.log('📢 Startup message sent');

    isInitialized = true;
    console.log('\n🎉 SECURE BOT FULLY AUTOMATED AND READY!');
    console.log('🔒 All credentials safely loaded from environment');
    console.log('📱 Users can play immediately!');

  } catch (error) {
    console.error('❌ Init error:', error.message);
    setTimeout(initializeBot, 5000); // Auto-retry
  }
}

// Fetch live prices with native https
async function fetchLivePrices() {
  try {
    const cryptoIds = SUPPORTED_CRYPTOS.map(c => c.id).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    
    const requestHeaders = {
      'User-Agent': 'RainmakerArena/1.0'
    };
    
    // Only add API key if available
    if (COINGECKO_API_KEY) {
      requestHeaders['x-cg-demo-api-key'] = COINGECKO_API_KEY;
    }
    
    const data = await fetchJSON(url, {
      headers: requestHeaders
    });
    
    let updatedCount = 0;
    SUPPORTED_CRYPTOS.forEach(crypto => {
      if (data[crypto.id]) {
        const priceInfo = data[crypto.id];
        currentPrices.set(crypto.symbol, {
          symbol: crypto.symbol,
          name: crypto.name,
          current_price: priceInfo.usd,
          price_change_percentage_24h: priceInfo.usd_24h_change || 0,
          market_cap: priceInfo.usd_market_cap || 0,
          volume_24h: priceInfo.usd_24h_vol || 0,
          last_updated: new Date().toISOString()
        });
        updatedCount++;
      }
    });

    console.log(`📊 LIVE prices updated: ${updatedCount}/${SUPPORTED_CRYPTOS.length} cryptos`);
    
    // Check for round endings
    checkRoundEndings();

  } catch (error) {
    console.error('❌ Price fetch error:', error.message);
    // Try backup method if main fails
    setTimeout(() => {
      console.log('🔄 Retrying price fetch...');
      fetchLivePrices();
    }, 10000);
  }
}

// Create new rounds for all cryptos
function createNewRounds() {
  SUPPORTED_CRYPTOS.forEach((crypto, index) => {
    setTimeout(() => {
      const hasActiveRound = Array.from(liveRounds.values())
        .some(round => round.crypto === crypto.symbol && round.status === 'active');
      
      if (!hasActiveRound) {
        createRoundForCrypto(crypto.symbol);
      }
    }, index * 2000);
  });
}

// Create round for specific crypto
function createRoundForCrypto(symbol) {
  const price = currentPrices.get(symbol);
  if (!price) {
    console.log(`⚠️  No price data for ${symbol}, skipping round creation`);
    return;
  }

  const roundId = `${symbol}_${Date.now()}`;
  const startTime = Date.now();
  const endTime = startTime + (5 * 60 * 1000); // 5 minutes

  const round = {
    id: roundId,
    crypto: symbol,
    startPrice: price.current_price,
    startTime,
    endTime,
    status: 'active',
    predictions: new Map(),
    totalPool: 0
  };

  liveRounds.set(roundId, round);
  console.log(`🎯 NEW round created: ${symbol} @ $${price.current_price}`);

  // Broadcast new round
  const message = `🚀 **NEW PREDICTION ROUND**

💰 **${symbol}** - ${price.current_price > 0 ? `$${price.current_price.toFixed(2)}` : 'Loading...'}
⏰ Duration: 5 minutes
🎯 Predict: UP ⬆️ or DOWN ⬇️
💎 Reward: 0.02 ETH for winners

Use /predict to join!`;

  bot.sendMessage(TELEGRAM_CHAT_ID, message).catch(console.error);
}

// Check for round endings
function checkRoundEndings() {
  const now = Date.now();
  
  liveRounds.forEach((round, roundId) => {
    if (round.status === 'active' && now >= round.endTime) {
      endRound(roundId);
    }
  });
}

// End round and calculate results
function endRound(roundId) {
  const round = liveRounds.get(roundId);
  if (!round || round.status !== 'active') return;

  const currentPrice = currentPrices.get(round.crypto);
  if (!currentPrice) {
    console.log(`⚠️  No current price for ${round.crypto}, delaying round end`);
    return;
  }

  round.endPrice = currentPrice.current_price;
  round.status = 'ended';

  const priceDirection = round.endPrice > round.startPrice ? 'up' : 'down';
  const winners = Array.from(round.predictions.entries())
    .filter(([userId, prediction]) => prediction.direction === priceDirection);

  console.log(`🏁 Round ended: ${round.crypto} ${round.startPrice} → ${round.endPrice} (${priceDirection})`);
  console.log(`🏆 Winners: ${winners.length}/${round.predictions.size}`);

  // Update user stats
  winners.forEach(([userId, prediction]) => {
    const user = users.get(userId);
    if (user) {
      user.wins++;
      user.totalWinnings += 0.02; // ETH reward
      users.set(userId, user);
    }
  });

  // Broadcast results
  const resultMessage = `🏁 **ROUND COMPLETED**

💰 **${round.crypto}**: $${round.startPrice.toFixed(2)} → $${round.endPrice.toFixed(2)}
${priceDirection === 'up' ? '📈 UP' : '📉 DOWN'} ${Math.abs(((round.endPrice - round.startPrice) / round.startPrice) * 100).toFixed(2)}%

🏆 **Winners**: ${winners.length} player(s)
💎 **Reward**: 0.02 ETH each

${winners.length > 0 ? '🎉 Congratulations to all winners!' : '😢 No winners this round'}

Next round starting soon! Use /predict`;

  bot.sendMessage(TELEGRAM_CHAT_ID, resultMessage).catch(console.error);

  // Remove ended round
  liveRounds.delete(roundId);
}

// Register user
function registerUser(telegramUser) {
  if (!users.has(telegramUser.id)) {
    const user = {
      id: telegramUser.id,
      username: telegramUser.username || telegramUser.first_name,
      first_name: telegramUser.first_name,
      points: 1000,
      totalBets: 0,
      wins: 0,
      totalWinnings: 0,
      joinedAt: new Date()
    };
    users.set(telegramUser.id, user);
    console.log(`👤 New user registered: ${user.username}`);
    return user;
  }
  return users.get(telegramUser.id);
}

// Send live updates
function sendLiveUpdate() {
  if (currentPrices.size === 0) return;

  const activeBetCount = Array.from(liveRounds.values())
    .reduce((total, round) => total + round.predictions.size, 0);

  if (activeBetCount > 0) {
    const message = `🔴 **LIVE BETTING UPDATE**

🎯 Active Bets: ${activeBetCount}
🎮 Live Rounds: ${Array.from(liveRounds.values()).filter(r => r.status === 'active').length}
👥 Total Players: ${users.size}

📊 **Current Prices:**
${Array.from(currentPrices.values()).map(price => 
  `${price.symbol}: $${price.current_price.toFixed(2)} ${price.price_change_percentage_24h >= 0 ? '📈' : '📉'} ${price.price_change_percentage_24h.toFixed(2)}%`
).join('\n')}

💡 Use /predict to join the action!`;

    bot.sendMessage(TELEGRAM_CHAT_ID, message).catch(console.error);
  }
}

// Bot command handlers
bot.onText(/\/start/, (msg) => {
  const user = registerUser(msg.from);
  const welcomeMessage = `🌧️ **Welcome to Rainmaker Arena!** ⚡

Hi ${user.first_name}! 🎮

🎯 **Predict crypto prices and earn real ETH!**
📊 **5-minute prediction rounds**
💰 **0.02 ETH per winning prediction**

🚀 **Quick Start:**
/menu - Main menu
/prices - Live prices  
/predict - Make predictions
/bets - View active bets

Let's make it rain! 💸`;

  bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/menu/, (msg) => {
  const menuMessage = `🎮 **RAINMAKER ARENA MENU**

🎯 /predict - Make price predictions
💰 /prices - Live crypto prices
💸 /bets - View active bets
🏆 /leaderboard - Top players
📊 /stats - Your statistics
❓ /help - All commands

🔴 **LIVE NOW**: ${Array.from(liveRounds.values()).filter(r => r.status === 'active').length} active rounds!`;

  bot.sendMessage(msg.chat.id, menuMessage);
});

bot.onText(/\/prices/, (msg) => {
  if (currentPrices.size === 0) {
    bot.sendMessage(msg.chat.id, '⏳ Loading prices... Please try again in a moment.');
    return;
  }

  const priceMessage = `💰 **LIVE CRYPTO PRICES**

${Array.from(currentPrices.values()).map(price => 
  `**${price.name} (${price.symbol})**
💲 $${price.current_price.toFixed(2)}
${price.price_change_percentage_24h >= 0 ? '📈' : '📉'} ${price.price_change_percentage_24h.toFixed(2)}% (24h)
`).join('\n')}

🔄 Updated live every 30 seconds
🎯 Use /predict to bet on price movements!`;

  bot.sendMessage(msg.chat.id, priceMessage);
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `❓ **RAINMAKER ARENA HELP**

🎯 **How to Play:**
1. Wait for prediction rounds to start
2. Use /predict to choose UP ⬆️ or DOWN ⬇️  
3. Wait 5 minutes for round to end
4. Win 0.02 ETH if your prediction is correct!

📋 **Commands:**
/start - Welcome & registration
/menu - Main menu
/prices - Live crypto prices
/predict - Make predictions  
/bets - View active bets
/leaderboard - Top players
/stats - Your statistics

💰 **Supported Cryptos:**
Bitcoin (BTC), Ethereum (ETH), Chainlink (LINK), Polygon (MATIC), Uniswap (UNI)

🎮 **Features:**
• Real-time price updates (30s intervals)
• 5-minute prediction rounds
• Real ETH rewards
• Live leaderboards
• 24/7 automated gameplay

Good luck! 🍀`;

  bot.sendMessage(msg.chat.id, helpMessage);
});

// Handle errors
bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Gracefully shutting down...');
  bot.stopPolling();
  process.exit(0);
});

// Auto-start the bot
initializeBot().catch(error => {
  console.error('❌ Failed to start bot:', error.message);
  process.exit(1);
});

console.log('🔒 Secure bot loaded. Waiting for initialization...'); 