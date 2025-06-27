import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegramBotService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify this is a valid Telegram webhook request
    if (!body.message && !body.callback_query) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const bot = getTelegramBot();
    if (!bot) {
      console.warn('Telegram bot not initialized - webhook request ignored');
      return NextResponse.json({ 
        error: 'Bot not available - configure TELEGRAM_BOT_TOKEN to enable webhook' 
      }, { status: 200 });
    }

    // Handle regular messages
    if (body.message) {
      const message = body.message;
      const chatId = message.chat.id.toString();
      const text = message.text;
      const userFirstName = message.from?.first_name;

      console.log(`📱 Telegram message from ${userFirstName} (${chatId}): ${text}`);

      // Handle commands
      if (text?.startsWith('/')) {
        await bot.handleCommand(chatId, text, userFirstName);
      } else {
        // Handle regular messages
        const responseMessage = `Hello ${userFirstName}! 👋

I'm the Whale Alerting Bot! I monitor crypto whale activities and send you real-time alerts.

Use /help to see available commands, or visit our game:
🎮 https://guess-the-whale.vercel.app`;

        await bot.sendMessage(chatId, responseMessage);
      }
    }

    // Handle callback queries (inline keyboard buttons)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id.toString();
      const data = callbackQuery.data;

      // Handle different callback actions
      switch (data) {
        case 'subscribe_alerts':
          await bot.sendMessage(chatId, '✅ You are now subscribed to whale alerts!');
          break;
        case 'unsubscribe_alerts':
          await bot.sendMessage(chatId, '❌ You have unsubscribed from whale alerts.');
          break;
        case 'play_game':
          await bot.sendMessage(chatId, '🎮 Click here to play: https://guess-the-whale.vercel.app');
          break;
        default:
          await bot.sendMessage(chatId, 'Unknown action.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  try {
    const bot = getTelegramBot();
    const isConnected = bot ? await bot.testConnection() : false;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      botConnected: isConnected,
      botAvailable: !!bot,
      message: bot 
        ? 'Telegram webhook endpoint is active' 
        : 'Telegram webhook endpoint is active but bot not configured'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        botConnected: false,
        botAvailable: false,
        error: 'Failed to check bot status'
      },
      { status: 200 } // Changed to 200 since this is expected behavior when no token is set
    );
  }
} 