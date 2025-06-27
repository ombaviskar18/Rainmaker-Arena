#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Starting Rainmaker Arena Telegram Bot...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️ .env file not found. Creating from template...');
  
  const templatePath = path.join(__dirname, '..', 'RAINMAKER_ARENA_ENV_TEMPLATE.env');
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, envPath);
    console.log('✅ .env file created from template');
    console.log('📝 Please check and update the .env file with your API keys\n');
  }
}

// Verify required environment variables
const requiredVars = {
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
  'TELEGRAM_CHAT_ID': process.env.TELEGRAM_CHAT_ID
};

console.log('🔍 Checking environment variables...');
let allGood = true;

for (const [varName, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'TELEGRAM_BOT_TOKEN' ? '***HIDDEN***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
}

if (!allGood) {
  console.log('\n❌ Missing required environment variables');
  console.log('📝 Please check your .env file and add the missing variables');
  process.exit(1);
}

console.log('\n🤖 Environment variables configured correctly!');
console.log('🎯 Initializing Telegram bot...\n');

// Test bot configuration
async function testBot() {
  try {
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    
    console.log('🔍 Testing bot connection...');
    
    // Get bot info
    const botInfo = await bot.getMe();
    console.log(`✅ Bot connected successfully!`);
    console.log(`🤖 Bot name: ${botInfo.first_name}`);
    console.log(`🆔 Bot username: @${botInfo.username}`);
    console.log(`📧 Bot ID: ${botInfo.id}`);
    
    // Test sending a message to your chat
    console.log('\n📤 Sending test message to your chat...');
    
    const testMessage = `🎉 Telegram Bot Test Successful! 🎉

✅ Bot Status: Connected and Working
🤖 Bot Name: ${botInfo.first_name}
🆔 Bot Username: @${botInfo.username}
💬 Chat ID: ${process.env.TELEGRAM_CHAT_ID}

🚀 Your Rainmaker Arena bot is ready!

🎮 Available Commands:
/start - Begin your journey
/menu - Main menu
/prices - Live crypto prices
/predict - Make predictions
/bets - View active bets
/leaderboard - Top players
/help - All commands

💰 Start earning ETH by predicting crypto prices!`;
    
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, testMessage);
    
    console.log('✅ Test message sent successfully!');
    console.log('📱 Check your Telegram to confirm the bot is working');
    
    // Stop the test bot before starting the game bot
    await bot.stopPolling();
    
    // Start the game bot
    console.log('\n🎮 Starting Rainmaker Arena game bot...');
    
    // Import and start the game bot
    const telegramGameBot = require('../src/lib/telegramGameBot.ts');
    console.log('📊 Game bot stats:', telegramGameBot.default?.getUserStats?.() || 'Initializing...');
    
    console.log('🎉 Telegram bot is now running!');
    console.log('\n🎯 **Quick Start Guide:**');
    console.log('1. Go to your Telegram chat');
    console.log('2. Send /start to begin');
    console.log('3. Use /menu for all options');
    console.log('4. Use /predict to start betting');
    console.log('5. Use /bets to see live betting activity');
    console.log('\n🔥 Your bot will automatically:');
    console.log('• Show live betting updates every 30 seconds');
    console.log('• Send hourly leaderboard updates');
    console.log('• Broadcast new rounds and results');
    console.log('• Alert about significant price movements');
    console.log('\n⚡ Keep this process running to maintain the bot!');
    
  } catch (error) {
    console.error('\n❌ Bot test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if your bot token is correct');
    console.log('2. Make sure your chat ID is correct');
    console.log('3. Ensure the bot is added to your chat');
    console.log('4. Check your internet connection');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Telegram bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Telegram bot...');
  process.exit(0);
});

// Start the bot
testBot().catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
}); 