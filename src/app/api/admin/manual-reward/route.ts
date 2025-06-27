import { NextRequest, NextResponse } from 'next/server';
import cdpWalletService from '../../../../lib/cdpWalletService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, reason, adminKey } = body;

    // Basic admin authentication (in production, use proper auth)
    const expectedAdminKey = process.env.ADMIN_SECRET_KEY || 'admin123';
    if (adminKey !== expectedAdminKey) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Validate inputs
    if (!walletAddress || !amount || !reason) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: walletAddress, amount, reason'
      }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Ethereum address format'
      }, { status: 400 });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount'
      }, { status: 400 });
    }

    // Execute manual reward
    console.log(`🎁 Manual reward: ${amount} ETH to ${walletAddress}`);
    const success = await cdpWalletService.manualReward(
      walletAddress,
      amount.toString(),
      reason
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Manual reward distributed successfully',
        details: {
          recipient: walletAddress,
          amount: amount,
          reason: reason,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to distribute manual reward'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error processing manual reward:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process manual reward',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get distribution history
    const history = cdpWalletService.getDistributionHistory();
    const stats = cdpWalletService.getStats();

    return NextResponse.json({
      success: true,
      data: {
        recentDistributions: history.slice(-10), // Last 10 distributions
        stats: {
          totalDistributions: history.length,
          communityPoolBalance: stats.communityPool?.totalBalance || '0',
          walletAddress: stats.walletAddress,
          isInitialized: stats.isInitialized
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting distribution data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get distribution data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 