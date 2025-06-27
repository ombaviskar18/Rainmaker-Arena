import { initializeTelegramBot, TelegramBotService } from './telegramBotService';

// Initialize Telegram bot with real-time whale monitoring
export function setupTelegramBot(): TelegramBotService | null {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

    if (!botToken || !botUsername) {
      console.warn('⚠️ Telegram bot credentials not found in environment variables');
      return null;
    }

    console.log('🤖 Initializing Telegram bot with real-time whale monitoring...');

    const telegramBot = initializeTelegramBot({
      botToken,
      botUsername,
      alchemyApiKey,
      etherscanApiKey,
    });

    // Test the connection
    telegramBot.testConnection().then(success => {
      if (success) {
        console.log('✅ Telegram bot initialized successfully!');
        console.log(`🔗 Bot invite link: ${telegramBot.getBotInviteLink()}`);
      } else {
        console.error('❌ Failed to initialize Telegram bot');
      }
    });

    return telegramBot;
  } catch (error) {
    console.error('❌ Error setting up Telegram bot:', error);
    return null;
  }
}

// Auto-initialize if running in Node.js environment
if (typeof window === 'undefined' && process.env.TELEGRAM_BOT_TOKEN) {
  setupTelegramBot();
} 