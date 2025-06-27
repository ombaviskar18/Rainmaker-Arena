import { NextRequest, NextResponse } from 'next/server';
import { initializeTelegramBot, getTelegramBot } from '@/lib/telegramBotService';
import { getTelegramConfig } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 Testing Telegram bot...');
    
    // Get configuration
    const telegramConfig = getTelegramConfig();
    console.log('📋 Config:', {
      botToken: telegramConfig.botToken ? 'Present' : 'Missing',
      botUsername: telegramConfig.botUsername,
      chatId: telegramConfig.chatId,
    });
    
    // Initialize bot
    const bot = initializeTelegramBot(telegramConfig);
    
    // Test connection
    const isConnected = await bot.testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Bot connection failed',
        config: {
          botUsername: telegramConfig.botUsername,
          hasToken: !!telegramConfig.botToken,
          hasChatId: !!telegramConfig.chatId,
        }
      }, { status: 500 });
    }
    
    // Get bot info
    const botInfo = await bot.getBotInfo();
    
    // Send test message if chat ID is available
    let messageResult = null;
    if (telegramConfig.chatId) {
      const testMessage = `🚀 <b>Bot Test from Application!</b>

✅ <b>Status:</b> Bot is working properly
⏰ <b>Time:</b> ${new Date().toLocaleString()}
🤖 <b>Bot:</b> @${botInfo?.username || 'Unknown'}

🐋 <b>Ready to send whale alerts!</b>
🎮 <b>Game:</b> https://whalehunter.vercel.app/

<b>Commands:</b>
/start - Subscribe to alerts
/help - Get help`;

      messageResult = await bot.sendMessage(telegramConfig.chatId, testMessage);
    }
    
    return NextResponse.json({
      success: true,
      botInfo: {
        id: botInfo?.id,
        username: botInfo?.username,
        firstName: botInfo?.first_name,
        canJoinGroups: botInfo?.can_join_groups,
      },
      config: {
        botUsername: telegramConfig.botUsername,
        hasToken: !!telegramConfig.botToken,
        hasChatId: !!telegramConfig.chatId,
        chatId: telegramConfig.chatId,
      },
      testMessage: {
        sent: !!messageResult,
        success: messageResult,
      },
      botLink: `https://t.me/${botInfo?.username || telegramConfig.botUsername}`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Bot test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, message } = await request.json();
    
    const bot = getTelegramBot();
    if (!bot) {
      return NextResponse.json({
        success: false,
        error: 'Bot not initialized'
      }, { status: 400 });
    }
    
    const telegramConfig = getTelegramConfig();
    
    switch (action) {
      case 'send_test':
        if (!telegramConfig.chatId) {
          return NextResponse.json({
            success: false,
            error: 'No chat ID configured'
          }, { status: 400 });
        }
        
        const result = await bot.sendMessage(telegramConfig.chatId, message || 'Test message from API');
        return NextResponse.json({
          success: result,
          timestamp: new Date().toISOString(),
        });
        
      case 'send_whale_alert':
        const demoAlert = {
          whale: 'Demo Whale',
          amount: '1,000 ETH ($2.5M)',
          action: 'Large transfer to Binance',
          network: 'ethereum',
          severity: 'high',
          timestamp: new Date().toLocaleTimeString()
        };
        
        const alertResult = await bot.sendWhaleAlert(demoAlert);
        return NextResponse.json({
          success: alertResult,
          alert: demoAlert,
          timestamp: new Date().toISOString(),
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Bot action error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 