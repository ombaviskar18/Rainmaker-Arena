import TelegramBot from 'node-telegram-bot-api';
import realTimePriceService, { PriceData, PredictionRound } from './realTimePriceService';

// ⚠️  SECURITY: Use environment variables for sensitive data
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN is required in environment variables');
}

if (!TELEGRAM_CHAT_ID) {
  throw new Error('❌ TELEGRAM_CHAT_ID is required in environment variables');
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

interface TelegramUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  wallet_address?: string;
  points: number;
  predictions: Map<string, 'up' | 'down'>;
  totalBets: number;
  wins: number;
  totalWinnings: number;
  joinedAt: Date;
}

interface BetInfo {
  roundId: string;
  crypto: string;
  prediction: 'up' | 'down';
  betAmount: number;
  startPrice: number;
  endTime: number;
  userId: number;
  username?: string;
  timestamp: Date;
}

class TelegramGameBot {
  private users: Map<number, TelegramUser> = new Map();
  private activeBets: Map<string, BetInfo[]> = new Map();
  private isInitialized = false;
  private broadcastChannelId = TELEGRAM_CHAT_ID;

  constructor() {
    this.initializeBot();
    this.startBetMonitoring();
    this.startRewardAlerts();
  }

  private async initializeBot() {
    if (this.isInitialized) return;

    try {
      // Set up comprehensive bot commands
      await bot.setMyCommands([
        { command: 'start', description: '🚀 Start Rainmaker Arena' },
        { command: 'menu', description: '🎮 Main menu' },
        { command: 'prices', description: '💰 Live crypto prices' },
        { command: 'predict', description: '🎯 Make predictions' },
        { command: 'rounds', description: '⏱️ Active rounds' },
        { command: 'bets', description: '💸 View active bets' },
        { command: 'leaderboard', description: '🏆 Top players' },
        { command: 'stats', description: '📊 Your statistics' },
        { command: 'wallet', description: '💳 Connect wallet' },
        { command: 'rewards', description: '🎁 Check rewards' },
        { command: 'help', description: '❓ All commands' }
      ]);

      // Send welcome message to your chat
      this.sendWelcomeToChannel();

      // Handle /start command
      bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        if (user) {
          this.registerUser(user);
          this.sendWelcomeMessage(chatId, user);
        }
      });

      // Handle /menu command
      bot.onText(/\/menu/, (msg) => {
        const chatId = msg.chat.id;
        this.sendMainMenu(chatId);
      });

      // Handle /prices command
      bot.onText(/\/prices/, (msg) => {
        const chatId = msg.chat.id;
        this.sendPrices(chatId);
      });

      // Handle /predict command
      bot.onText(/\/predict/, (msg) => {
        const chatId = msg.chat.id;
        this.showPredictionRounds(chatId);
      });

      // Handle /rounds command
      bot.onText(/\/rounds/, (msg) => {
        const chatId = msg.chat.id;
        this.showActiveRounds(chatId);
      });

      // Handle /bets command
      bot.onText(/\/bets/, (msg) => {
        const chatId = msg.chat.id;
        this.showActiveBets(chatId);
      });

      // Handle /leaderboard command
      bot.onText(/\/leaderboard/, (msg) => {
        const chatId = msg.chat.id;
        this.showLeaderboard(chatId);
      });

      // Handle /stats command
      bot.onText(/\/stats/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        if (userId) {
          this.showUserStats(chatId, userId);
        }
      });

      // Handle /wallet command
      bot.onText(/\/wallet/, (msg) => {
        const chatId = msg.chat.id;
        this.handleWalletConnection(chatId);
      });

      // Handle /rewards command
      bot.onText(/\/rewards/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        if (userId) {
          this.showRewards(chatId, userId);
        }
      });

      // Handle /help command
      bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        this.showHelp(chatId);
      });

      // Handle callback queries (inline keyboard buttons)
      bot.on('callback_query', (query) => {
        this.handleCallbackQuery(query);
      });

      // Subscribe to price service events
      realTimePriceService.on('priceUpdate', (prices: PriceData[]) => {
        this.broadcastPriceUpdate(prices);
      });

      realTimePriceService.on('newRound', (round: PredictionRound) => {
        this.broadcastNewRound(round);
      });

      realTimePriceService.on('roundEnded', (result) => {
        this.broadcastRoundResult(result);
      });

      this.isInitialized = true;
      console.log('🤖 Rainmaker Arena Telegram bot initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
    }
  }

  private async sendWelcomeToChannel() {
    const welcomeMessage = `
🌧️⚡ **RAINMAKER ARENA BOT ACTIVATED** ⚡🌧️

🚀 **Your Ultimate Crypto Gaming Platform is LIVE!**

🎯 **Features:**
• Real-time crypto price predictions
• Live ETH betting & rewards
• Multi-chain support (9 cryptocurrencies)
• NFT marketplace integration
• Leaderboards & statistics

🎮 **Quick Start:**
/start - Begin your journey
/menu - Access main features
/bets - Monitor live bets
/leaderboard - See top players

💰 **Earn Real ETH by predicting crypto prices!**
    `;

    try {
      await bot.sendMessage(this.broadcastChannelId, welcomeMessage, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to send welcome to channel:', error);
    }
  }

  private registerUser(telegramUser: any): TelegramUser {
    if (this.users.has(telegramUser.id)) {
      return this.users.get(telegramUser.id)!;
    }

    const user: TelegramUser = {
      id: telegramUser.id,
      username: telegramUser.username,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      points: 1000, // Starting points
      predictions: new Map(),
      totalBets: 0,
      wins: 0,
      totalWinnings: 0,
      joinedAt: new Date()
    };

    this.users.set(telegramUser.id, user);
    console.log(`🆕 New user registered: ${user.first_name} (@${user.username})`);
    return user;
  }

  private async sendWelcomeMessage(chatId: number, user: any) {
    const welcomeMessage = `
🌧️⚡ **Welcome to Rainmaker Arena, ${user.first_name}!** ⚡🌧️

🎉 **You've joined the ultimate crypto gaming platform!**

🎯 **What You Can Do:**
💰 Predict crypto prices & earn real ETH
🏆 Compete on global leaderboards  
📊 Track your winning statistics
🎮 Play across 9 different cryptocurrencies
💎 Trade NFTs in our marketplace

🚀 **Your Starting Balance:** 1,000 Points
💳 **Starting Wallet:** Not connected

🎮 **Quick Actions:**
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 View Prices', callback_data: 'prices' },
          { text: '🎯 Start Betting', callback_data: 'predict' }
        ],
        [
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
          { text: '📊 My Stats', callback_data: 'stats' }
        ],
        [
          { text: '💳 Connect Wallet', callback_data: 'wallet' },
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    };

    try {
      await bot.sendMessage(chatId, welcomeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard,
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  }

  private async sendMainMenu(chatId: number) {
    const menuMessage = `
🎮 **RAINMAKER ARENA - MAIN MENU** 🎮

🚀 **Choose your action:**
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 Live Prices', callback_data: 'prices' },
          { text: '🎯 Make Prediction', callback_data: 'predict' }
        ],
        [
          { text: '⏱️ Active Rounds', callback_data: 'rounds' },
          { text: '💸 View Bets', callback_data: 'bets' }
        ],
        [
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
          { text: '📊 My Statistics', callback_data: 'stats' }
        ],
        [
          { text: '🎁 My Rewards', callback_data: 'rewards' },
          { text: '💳 Wallet', callback_data: 'wallet' }
        ],
        [
          { text: '❓ Help & Commands', callback_data: 'help' }
        ]
      ]
    };

    await bot.sendMessage(chatId, menuMessage, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async sendPrices(chatId: number) {
    const prices = realTimePriceService.getPrices();
    
    if (prices.length === 0) {
      bot.sendMessage(chatId, '⏳ Loading price data... Please try again in a moment.');
      return;
    }

    let message = '💰 **LIVE CRYPTO PRICES** 💰\n\n';
    
    prices.forEach((price, index) => {
      const changeEmoji = price.price_change_percentage_24h >= 0 ? '📈' : '📉';
      const changeSign = price.price_change_percentage_24h >= 0 ? '+' : '';
      const priceFormatted = price.current_price < 1 ? 
        price.current_price.toFixed(6) : 
        price.current_price.toLocaleString();
      
      message += `${index + 1}. ${changeEmoji} **${price.symbol.toUpperCase()}**\n`;
      message += `💵 $${priceFormatted}\n`;
      message += `📊 ${changeSign}${price.price_change_percentage_24h.toFixed(2)}% (24h)\n\n`;
    });

    message += '🎯 **Ready to predict?** Use /predict to start!';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🎯 Make Prediction', callback_data: 'predict' },
          { text: '🔄 Refresh Prices', callback_data: 'prices' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async showPredictionRounds(chatId: number) {
    const activeRounds = realTimePriceService.getActiveRounds();
    
    if (activeRounds.length === 0) {
      const message = `
⏳ **No Active Rounds Right Now**

🔄 New prediction rounds start every 5 minutes!
⚡ Get ready for the next round...

📊 **Supported Cryptocurrencies:**
• Bitcoin (BTC) • Ethereum (ETH) • Chainlink (LINK)
• Polygon (MATIC) • Uniswap (UNI) • Avalanche (AVAX)
• Solana (SOL) • Cardano (ADA) • Polkadot (DOT)
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Check Again', callback_data: 'predict' },
            { text: '💰 View Prices', callback_data: 'prices' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'menu' }
          ]
        ]
      };

      await bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      });
      return;
    }

    let message = '🎯 **ACTIVE PREDICTION ROUNDS** 🎯\n\n';
    
    const keyboard: any[][] = [];
    
    activeRounds.forEach((round, index) => {
      const crypto = round.crypto;
      const timeLeft = Math.max(0, round.endTime - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const totalPool = round.predictions.reduce((sum, p) => sum + p.betAmount, 0);
      const upBets = round.predictions.filter(p => p.prediction === 'up').length;
      const downBets = round.predictions.filter(p => p.prediction === 'down').length;
      
      message += `${index + 1}. **${crypto.toUpperCase()}** 🚀\n`;
      message += `💵 Start: $${round.startPrice.toFixed(4)}\n`;
      message += `⏱️ Time: ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
      message += `💰 Pool: ${totalPool.toFixed(4)} ETH\n`;
      message += `📊 Bets: ${upBets}⬆️ | ${downBets}⬇️\n\n`;
      
      // Add prediction buttons
      keyboard.push([
        { text: `📈 ${crypto.toUpperCase()} UP`, callback_data: `predict_${round.id}_up` },
        { text: `📉 ${crypto.toUpperCase()} DOWN`, callback_data: `predict_${round.id}_down` }
      ]);
    });

    // Add navigation buttons
    keyboard.push([
      { text: '🔄 Refresh', callback_data: 'predict' },
      { text: '💸 View Bets', callback_data: 'bets' }
    ]);
    keyboard.push([{ text: '🏠 Main Menu', callback_data: 'menu' }]);

    const options = {
      parse_mode: 'Markdown' as const,
      reply_markup: { inline_keyboard: keyboard }
    };

    await bot.sendMessage(chatId, message, options);
  }

  private async showActiveRounds(chatId: number) {
    await this.showPredictionRounds(chatId);
  }

  private async showActiveBets(chatId: number) {
    const allBets: BetInfo[] = [];
    this.activeBets.forEach(bets => allBets.push(...bets));

    if (allBets.length === 0) {
      const message = `
💸 **NO ACTIVE BETS**

🎯 No one has placed any bets yet!
⚡ Be the first to predict and earn ETH rewards!

🚀 **Start betting with /predict**
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🎯 Make Prediction', callback_data: 'predict' },
            { text: '💰 View Prices', callback_data: 'prices' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'menu' }
          ]
        ]
      };

      await bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      });
      return;
    }

    let message = '💸 **LIVE BETTING ACTIVITY** 💸\n\n';
    
    // Group bets by round
    const betsByRound = new Map<string, BetInfo[]>();
    allBets.forEach(bet => {
      if (!betsByRound.has(bet.roundId)) {
        betsByRound.set(bet.roundId, []);
      }
      betsByRound.get(bet.roundId)!.push(bet);
    });

    let roundIndex = 1;
    betsByRound.forEach((bets, roundId) => {
      const firstBet = bets[0];
      const timeLeft = Math.max(0, firstBet.endTime - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      
      message += `🎯 **Round ${roundIndex}: ${firstBet.crypto.toUpperCase()}**\n`;
      message += `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')} remaining\n`;
      message += `💵 Start: $${firstBet.startPrice.toFixed(4)}\n\n`;

      bets.forEach((bet, index) => {
        const emoji = bet.prediction === 'up' ? '📈' : '📉';
        const username = bet.username || 'Anonymous';
        message += `${emoji} **@${username}**: ${bet.betAmount} ETH ${bet.prediction.toUpperCase()}\n`;
      });

      message += '\n';
      roundIndex++;
    });

    message += `💰 **Total Active Bets:** ${allBets.length}\n`;
    message += `🎰 **Total Volume:** ${allBets.reduce((sum, bet) => sum + bet.betAmount, 0).toFixed(4)} ETH`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Refresh Bets', callback_data: 'bets' },
          { text: '🎯 Make Prediction', callback_data: 'predict' }
        ],
        [
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async showLeaderboard(chatId: number) {
    const sortedUsers = Array.from(this.users.values())
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .slice(0, 10);

    if (sortedUsers.length === 0) {
      const message = `
🏆 **LEADERBOARD EMPTY**

🎯 No winners yet! Be the first to climb the ranks!
💰 Start predicting and earning ETH rewards!

🚀 **Start with /predict**
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🎯 Start Betting', callback_data: 'predict' },
            { text: '💰 View Prices', callback_data: 'prices' }
          ],
          [
            { text: '🏠 Main Menu', callback_data: 'menu' }
          ]
        ]
      };

      await bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      });
      return;
    }

    let message = '🏆 **RAINMAKER ARENA LEADERBOARD** 🏆\n\n';
    
    sortedUsers.forEach((user, index) => {
      const trophy = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      const winRate = user.totalBets > 0 ? ((user.wins / user.totalBets) * 100).toFixed(1) : '0.0';
      
      message += `${trophy} **${index + 1}. ${user.first_name}**\n`;
      message += `💰 Winnings: ${user.totalWinnings.toFixed(4)} ETH\n`;
      message += `📊 Win Rate: ${winRate}% (${user.wins}/${user.totalBets})\n`;
      message += `🎯 Points: ${user.points.toLocaleString()}\n\n`;
    });

    message += '🚀 **Climb the ranks and earn more ETH!**';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 My Stats', callback_data: 'stats' },
          { text: '🎯 Start Betting', callback_data: 'predict' }
        ],
        [
          { text: '🔄 Refresh', callback_data: 'leaderboard' },
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async showUserStats(chatId: number, userId: number) {
    const user = this.users.get(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ User not found. Please use /start first.');
      return;
    }

    const winRate = user.totalBets > 0 ? ((user.wins / user.totalBets) * 100).toFixed(1) : '0.0';
    const avgWinning = user.wins > 0 ? (user.totalWinnings / user.wins).toFixed(4) : '0.0000';
    const daysSinceJoined = Math.floor((Date.now() - user.joinedAt.getTime()) / (1000 * 60 * 60 * 24));

    const message = `
📊 **YOUR STATISTICS** 📊

👤 **Player:** ${user.first_name}
🆔 **Username:** @${user.username || 'Not set'}
📅 **Joined:** ${daysSinceJoined} days ago

💰 **EARNINGS:**
🏆 Total Winnings: ${user.totalWinnings.toFixed(4)} ETH
🎯 Points Balance: ${user.points.toLocaleString()}
💵 Avg Win: ${avgWinning} ETH

📈 **PERFORMANCE:**
🎲 Total Bets: ${user.totalBets}
✅ Wins: ${user.wins}
❌ Losses: ${user.totalBets - user.wins}
📊 Win Rate: ${winRate}%

🔗 **WALLET:** ${user.wallet_address ? '✅ Connected' : '❌ Not Connected'}

${user.totalWinnings > 0 ? '🌟 **Keep up the great work!**' : '🚀 **Start betting to see your stats grow!**'}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
          { text: '🎁 My Rewards', callback_data: 'rewards' }
        ],
        [
          { text: '🎯 Make Prediction', callback_data: 'predict' },
          { text: '💳 Connect Wallet', callback_data: 'wallet' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async showRewards(chatId: number, userId: number) {
    const user = this.users.get(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ User not found. Please use /start first.');
      return;
    }

    const message = `
🎁 **YOUR REWARDS** 🎁

💰 **Current Balance:**
🏆 Total Winnings: ${user.totalWinnings.toFixed(4)} ETH
🎯 Points: ${user.points.toLocaleString()}

💳 **Wallet Status:** ${user.wallet_address ? '✅ Connected' : '❌ Not Connected'}

${user.wallet_address ? 
  `🔗 **Address:** \`${user.wallet_address}\`` : 
  '⚠️ **Connect your wallet to receive ETH rewards!**'
}

🎰 **Earning Methods:**
• 🎯 Win price predictions → ETH rewards
• 🏆 Climb leaderboards → Bonus points  
• 💎 Trade NFTs → Marketplace rewards
• 🎮 Daily participation → Point bonuses

${user.totalWinnings > 0 ? 
  '✨ **Your rewards are automatically sent to your connected wallet!**' : 
  '🚀 **Start predicting to earn your first rewards!**'
}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 Connect Wallet', callback_data: 'wallet' },
          { text: '🎯 Start Betting', callback_data: 'predict' }
        ],
        [
          { text: '📊 My Stats', callback_data: 'stats' },
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async handleWalletConnection(chatId: number) {
    const message = `
💳 **CONNECT YOUR WALLET** 💳

🔗 **To receive ETH rewards, connect your wallet:**

1️⃣ Visit our web app: rainmaker-arena.vercel.app
2️⃣ Connect your MetaMask or compatible wallet
3️⃣ Your winnings will be sent automatically!

🛡️ **Security:** We only need your wallet address for payouts
🚀 **Supported:** MetaMask, WalletConnect, Coinbase Wallet

⚡ **Why connect?**
• Receive real ETH rewards instantly
• Participate in NFT marketplace
• Access premium features
• Higher betting limits

💰 **Start earning real crypto today!**
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Open Web App', url: 'https://rainmaker-arena.vercel.app' }
        ],
        [
          { text: '🎯 Start Betting', callback_data: 'predict' },
          { text: '📊 My Stats', callback_data: 'stats' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async showHelp(chatId: number) {
    const message = `
❓ **RAINMAKER ARENA - HELP GUIDE** ❓

🎮 **MAIN COMMANDS:**
/start - Welcome & registration
/menu - Main navigation menu
/prices - Live crypto prices
/predict - Make price predictions
/rounds - View active rounds
/bets - See all active bets
/leaderboard - Top players
/stats - Your statistics
/rewards - Check your rewards
/wallet - Connect wallet
/help - This help guide

🎯 **HOW TO PLAY:**
1️⃣ Check live prices with /prices
2️⃣ Use /predict to see active rounds
3️⃣ Choose UP or DOWN for any crypto
4️⃣ Wait for round to end (5 minutes)
5️⃣ Win ETH if you predicted correctly!

💰 **EARNING REWARDS:**
• 🎯 Correct predictions = ETH rewards
• 🏆 Top leaderboard = Bonus points
• 🎮 Daily activity = Point rewards
• 💎 NFT trading = Marketplace fees

🎰 **SUPPORTED CRYPTOCURRENCIES:**
Bitcoin (BTC), Ethereum (ETH), Chainlink (LINK),
Polygon (MATIC), Uniswap (UNI), Avalanche (AVAX),
Solana (SOL), Cardano (ADA), Polkadot (DOT)

🛡️ **SECURITY:** Your funds are protected by smart contracts
⚡ **INSTANT:** Rewards sent automatically to your wallet

🚀 **Ready to start? Use /predict now!**
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🎯 Start Betting', callback_data: 'predict' },
          { text: '💰 View Prices', callback_data: 'prices' }
        ],
        [
          { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
          { text: '💳 Connect Wallet', callback_data: 'wallet' }
        ],
        [
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }

  private async handleCallbackQuery(query: any) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    // Answer the callback query to remove loading state
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'menu':
        await this.sendMainMenu(chatId);
        break;
      case 'prices':
        await this.sendPrices(chatId);
        break;
      case 'predict':
        await this.showPredictionRounds(chatId);
        break;
      case 'rounds':
        await this.showActiveRounds(chatId);
        break;
      case 'bets':
        await this.showActiveBets(chatId);
        break;
      case 'leaderboard':
        await this.showLeaderboard(chatId);
        break;
      case 'stats':
        await this.showUserStats(chatId, userId);
        break;
      case 'rewards':
        await this.showRewards(chatId, userId);
        break;
      case 'wallet':
        await this.handleWalletConnection(chatId);
        break;
      case 'help':
        await this.showHelp(chatId);
        break;
      default:
        if (data.startsWith('predict_')) {
          const [, roundId, direction] = data.split('_');
          await this.handlePrediction(chatId, userId, roundId, direction as 'up' | 'down');
        }
        break;
    }
  }

  private async handlePrediction(chatId: number, userId: number, roundId: string, direction: 'up' | 'down') {
    const user = this.users.get(userId);
    if (!user) {
      await bot.sendMessage(chatId, '❌ Please use /start first to register.');
      return;
    }

    // Check if user already predicted for this round
    if (user.predictions.has(roundId)) {
      await bot.sendMessage(chatId, '⚠️ You have already made a prediction for this round!');
      return;
    }

    // Get the round info
    const activeRounds = realTimePriceService.getActiveRounds();
    const round = activeRounds.find(r => r.id === roundId);
    
    if (!round) {
      await bot.sendMessage(chatId, '❌ This round is no longer active.');
      return;
    }

    // Simulate a bet (you can integrate with real betting system)
    const betAmount = 0.01; // Default bet amount
    
    // Record the prediction
    user.predictions.set(roundId, direction);
    user.totalBets++;
    
    // Add to active bets tracking
    if (!this.activeBets.has(roundId)) {
      this.activeBets.set(roundId, []);
    }
    
    const betInfo: BetInfo = {
      roundId,
      crypto: round.crypto,
      prediction: direction,
      betAmount,
      startPrice: round.startPrice,
      endTime: round.endTime,
      userId,
      username: user.username,
      timestamp: new Date()
    };
    
    this.activeBets.get(roundId)!.push(betInfo);

    const directionEmoji = direction === 'up' ? '📈' : '📉';
    const timeLeft = Math.max(0, round.endTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const message = `
✅ **PREDICTION PLACED!** ✅

${directionEmoji} **${round.crypto.toUpperCase()} ${direction.toUpperCase()}**
💰 Bet Amount: ${betAmount} ETH
💵 Start Price: $${round.startPrice.toFixed(4)}
⏱️ Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}

🎰 **Your bet is now live!**
🏆 Win rewards if you're correct!

🔔 **You'll be notified when the round ends**
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💸 View All Bets', callback_data: 'bets' },
          { text: '📊 My Stats', callback_data: 'stats' }
        ],
        [
          { text: '🎯 Make Another Bet', callback_data: 'predict' },
          { text: '🏠 Main Menu', callback_data: 'menu' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });

    // Broadcast new bet to channel
    this.broadcastNewBet(betInfo, user);
  }

  private async broadcastNewBet(bet: BetInfo, user: TelegramUser) {
    const directionEmoji = bet.prediction === 'up' ? '📈' : '📉';
    const timeLeft = Math.max(0, bet.endTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const message = `
🎰 **NEW BET PLACED!** 🎰

👤 **Player:** ${user.first_name} (@${user.username || 'Anonymous'})
${directionEmoji} **Prediction:** ${bet.crypto.toUpperCase()} ${bet.prediction.toUpperCase()}
💰 **Amount:** ${bet.betAmount} ETH
💵 **Start Price:** $${bet.startPrice.toFixed(4)}
⏱️ **Time Left:** ${minutes}:${seconds.toString().padStart(2, '0')}

🚀 **Join the action with /predict!**
    `;

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast new bet:', error);
    }
  }

  private startBetMonitoring() {
    // Monitor and broadcast bet updates every 30 seconds
    setInterval(() => {
      this.broadcastBetUpdate();
    }, 30000);
  }

  private async broadcastBetUpdate() {
    const allBets: BetInfo[] = [];
    this.activeBets.forEach(bets => allBets.push(...bets));

    if (allBets.length === 0) return;

    const totalVolume = allBets.reduce((sum, bet) => sum + bet.betAmount, 0);
    const uniqueRounds = new Set(allBets.map(bet => bet.roundId)).size;

    const message = `
📊 **LIVE BETTING UPDATE** 📊

🎰 **Active Bets:** ${allBets.length}
💰 **Total Volume:** ${totalVolume.toFixed(4)} ETH
🎯 **Active Rounds:** ${uniqueRounds}
👥 **Players:** ${new Set(allBets.map(bet => bet.userId)).size}

🚀 **Join the action: /predict**
📈 **View all bets: /bets**
    `;

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast bet update:', error);
    }
  }

  private startRewardAlerts() {
    // Send reward alerts every hour
    setInterval(() => {
      this.broadcastRewardAlert();
    }, 3600000); // 1 hour
  }

  private async broadcastRewardAlert() {
    const topUsers = Array.from(this.users.values())
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .slice(0, 3);

    if (topUsers.length === 0) return;

    const totalRewards = Array.from(this.users.values())
      .reduce((sum, user) => sum + user.totalWinnings, 0);

    let message = `
🏆 **HOURLY LEADERBOARD UPDATE** 🏆

💰 **Total Rewards Distributed:** ${totalRewards.toFixed(4)} ETH

🥇 **TOP PLAYERS:**
`;

    topUsers.forEach((user, index) => {
      const trophy = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      message += `${trophy} ${user.first_name}: ${user.totalWinnings.toFixed(4)} ETH\n`;
    });

    message += `\n🚀 **Compete for rewards: /predict**\n🏆 **Full leaderboard: /leaderboard**`;

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast reward alert:', error);
    }
  }

  private async broadcastPriceUpdate(prices: PriceData[]) {
    // Broadcast significant price movements (>5%)
    const significantMoves = prices.filter(price => 
      Math.abs(price.price_change_percentage_24h) > 5
    );

    if (significantMoves.length === 0) return;

    let message = '📊 **SIGNIFICANT PRICE MOVEMENTS** 📊\n\n';
    
    significantMoves.forEach(price => {
      const emoji = price.price_change_percentage_24h > 0 ? '🚀' : '💥';
      message += `${emoji} **${price.symbol.toUpperCase()}**: ${price.price_change_percentage_24h > 0 ? '+' : ''}${price.price_change_percentage_24h.toFixed(2)}%\n`;
    });

    message += '\n🎯 **Perfect time to predict: /predict**';

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast price update:', error);
    }
  }

  private async broadcastNewRound(round: PredictionRound) {
    const message = `
🎯 **NEW PREDICTION ROUND STARTED!** 🎯

🚀 **${round.crypto.toUpperCase()}** is now available for predictions!
💵 **Starting Price:** $${round.startPrice.toFixed(4)}
⏱️ **Duration:** 5 minutes
💰 **Rewards:** Real ETH for winners!

📈 Will it go UP or DOWN? 📉

🎮 **Place your bet: /predict**
    `;

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast new round:', error);
    }
  }

  private async broadcastRoundResult(result: any) {
    const message = `
🎉 **ROUND RESULT** 🎉

🚀 **${result.crypto?.toUpperCase() || 'CRYPTO'}** Round Ended!
💵 **Final Price:** $${result.endPrice?.toFixed(4) || '0.0000'}
${result.winner === 'up' ? '📈' : '📉'} **Winner:** ${result.winner?.toUpperCase() || 'TBD'}
💰 **Rewards Distributed:** ${result.totalRewards?.toFixed(4) || '0.0000'} ETH

🏆 **Congratulations to all winners!**

🎯 **Next round starting soon: /predict**
    `;

    try {
      await bot.sendMessage(this.broadcastChannelId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Failed to broadcast round result:', error);
    }

    // Clean up finished round bets
    if (result.roundId) {
      this.activeBets.delete(result.roundId);
    }
  }

  public async sendMessageToUser(userId: number, message: string) {
    try {
      await bot.sendMessage(userId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error);
    }
  }

  public getUserStats() {
    return {
      totalUsers: this.users.size,
      totalBets: Array.from(this.users.values()).reduce((sum, user) => sum + user.totalBets, 0),
      totalWinnings: Array.from(this.users.values()).reduce((sum, user) => sum + user.totalWinnings, 0),
      activeBets: Array.from(this.activeBets.values()).flat().length
    };
  }

  public destroy() {
    if (bot) {
      bot.stopPolling();
    }
  }
}

// Create and export the bot instance
const telegramGameBot = new TelegramGameBot();
export default telegramGameBot; 