import { NextRequest, NextResponse } from 'next/server';
import { cdpWalletService } from '../../../lib/cdpWalletService';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'distributeGameWinnings':
        const { roundId, winners } = params;
        const success = await cdpWalletService.distributeGameWinnings(roundId, winners);
        return NextResponse.json({ success });

      case 'manualReward':
        const { walletAddress, amount, reason } = params;
        const rewardSuccess = await cdpWalletService.manualReward(walletAddress, amount, reason);
        return NextResponse.json({ success: rewardSuccess });

      case 'getStats':
        const stats = cdpWalletService.getStats();
        return NextResponse.json({ stats });

      case 'getCommunityPoolInfo':
        const poolInfo = cdpWalletService.getCommunityPoolInfo();
        return NextResponse.json({ poolInfo });

      case 'getDistributionHistory':
        const history = cdpWalletService.getDistributionHistory();
        return NextResponse.json({ history });

      case 'getWalletBalance':
        const balance = await cdpWalletService.getWalletBalance();
        return NextResponse.json({ balance });

      case 'getWalletAddress':
        const address = cdpWalletService.getWalletAddress();
        return NextResponse.json({ address });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CDP Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = cdpWalletService.getStats();
    const poolInfo = cdpWalletService.getCommunityPoolInfo();
    
    return NextResponse.json({
      stats,
      poolInfo,
      walletAddress: cdpWalletService.getWalletAddress()
    });
  } catch (error) {
    console.error('CDP Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 