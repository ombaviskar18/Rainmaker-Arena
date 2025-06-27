import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot, initializeTelegramBot } from '@/lib/telegramBotService';
import { getTelegramConfig } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing Telegram bot...');
    
    const telegramConfig = getTelegramConfig();
    
    if (!telegramConfig.botToken) {
      return NextResponse.json({
        success: false,
        error: 'Bot token not configured'
      }, { status: 400 });
    }

    // Initialize the bot
    const bot = initializeTelegramBot(telegramConfig);
    
    // Set webhook URL for production
    const webhookUrl = 'https://whalehunter.vercel.app/api/telegram-webhook';
    
    // Initialize bot with webhook
    const initialized = await bot.initializeBot(webhookUrl);
    
    if (!initialized) {
      throw new Error('Failed to initialize bot');
    }

    console.log('✅ Telegram bot initialized successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Telegram bot initialized successfully',
      webhookUrl,
      botUsername: telegramConfig.botUsername
    });

  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bot = getTelegramBot();
    const isInitialized = !!bot;
    
    let connectionStatus = false;
    if (bot) {
      connectionStatus = await bot.testConnection();
    }

    return NextResponse.json({
      initialized: isInitialized,
      connected: connectionStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      initialized: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 