import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegramBotService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.alert) {
      return NextResponse.json(
        { error: 'Alert data is required' },
        { status: 400 }
      );
    }

    const { alert, chatId } = body;

    const bot = getTelegramBot();
    if (!bot) {
      console.warn('Telegram bot not initialized - skipping alert');
      return NextResponse.json(
        { 
          success: false,
          error: 'Telegram bot not available - configure TELEGRAM_BOT_TOKEN to enable alerts' 
        },
        { status: 200 } // Changed to 200 since this is expected behavior
      );
    }

    let success = false;

    // Send to specific chat ID if provided
    if (chatId) {
      success = await bot.sendWhaleAlert(alert);
    } else {
      // Send to default broadcast (if configured)
      success = await bot.sendWhaleAlert(alert);
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Alert sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send alert' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending whale alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test endpoint for sending sample alerts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');

    const bot = getTelegramBot();
    if (!bot) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Telegram bot not available - configure TELEGRAM_BOT_TOKEN to enable test alerts' 
        },
        { status: 200 }
      );
    }

    // Create a sample whale alert
    const sampleAlert = {
      id: `test_${Date.now()}`,
      whale: 'Vitalik Buterin',
      action: 'Transferred 1,000 ETH',
      amount: '$2.3M',
      severity: 'critical' as const,
      timestamp: 'Just now',
      transaction: {
        id: `test_tx_${Date.now()}`,
        hash: '0x1234567890abcdef',
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to: '0x742d35Cc7BF4C8743Fd5c8b4fF67d8D7c53C8E5F',
        value: '1000.0',
        valueUSD: 2300000,
        timestamp: Date.now(),
        network: 'ethereum' as const,
        type: 'transfer' as const
      },
      whaleAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    };

    let success = false;
    if (chatId) {
      success = await bot.sendMessage(chatId, bot.sendWhaleAlert ? 
        await bot.sendWhaleAlert(sampleAlert) : 
        'Test whale alert sent!'
      );
    } else {
      success = await bot.sendWhaleAlert(sampleAlert);
    }

    return NextResponse.json({
      success,
      message: success ? 'Test alert sent successfully' : 'Failed to send test alert',
      alert: sampleAlert
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 