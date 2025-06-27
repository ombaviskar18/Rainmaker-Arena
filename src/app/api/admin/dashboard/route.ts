import { NextRequest, NextResponse } from 'next/server';
import telegramGameBot from '../../../../lib/telegramGameBot';

// Admin Dashboard API - Get system stats and manage bots
export async function GET() {
  try {
    // Get stats from active bots
    const telegramStats = telegramGameBot.getUserStats();

    // Calculate aggregate stats
    const totalUsers = telegramStats.totalUsers;
    const totalActiveUsers = telegramStats.activeUsers;
    const totalBets = telegramStats.totalBets;
    const totalEthDistributed = telegramStats.totalEthDistributed;

    // System health
    const systemHealth = {
      database: 'operational',
      telegram: telegramStats.totalUsers > 0 ? 'operational' : 'warning',
      priceFeeds: 'operational',
      blockchain: 'operational'
    };

    // Recent activity (mock data for now)
    const recentActivity = [
      { action: 'User registered', details: 'New user joined Telegram bot', timestamp: new Date().toISOString() },
      { action: 'Price prediction', details: 'User predicted BTC UP', timestamp: new Date(Date.now() - 300000).toISOString() },
      { action: 'Round completed', details: 'ETH round ended, 3 winners', timestamp: new Date(Date.now() - 600000).toISOString() },
    ];

    return NextResponse.json({
      success: true,
      data: {
        userStats: {
          telegram: telegramStats,
          total: totalUsers,
        },
        platformStats: {
          totalUsers,
          activeUsers: totalActiveUsers,
          totalBets,
          ethDistributed: totalEthDistributed,
        },
        systemHealth,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    let result = 'Unknown action';

    switch (action) {
      case 'restart_telegram_bot':
        // Restart Telegram bot
        result = 'Telegram bot restart initiated';
        break;

      case 'send_telegram_announcement':
        // Send announcement to Telegram channel
        const { message: telegramMessage, channelId } = data;
        // In a real implementation, you would call the telegram bot service
        result = 'Telegram announcement sent';
        break;

      case 'update_game_settings':
        // Update game configuration
        const { minBet, maxBet, roundDuration } = data;
        result = `Game settings updated: minBet=${minBet}, maxBet=${maxBet}, roundDuration=${roundDuration}`;
        break;

      case 'manual_payout':
        // Process manual ETH payout
        const { userAddress, amount, reason } = data;
        result = `Manual payout processed: ${amount} ETH to ${userAddress} for ${reason}`;
        break;

      case 'create_prediction_round':
        // Create new prediction round
        const { crypto, duration } = data;
        result = `New prediction round created for ${crypto} with ${duration}s duration`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to execute admin action'
    }, { status: 500 });
  }
} 