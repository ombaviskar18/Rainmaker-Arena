import { Coinbase, Wallet, WalletData } from '@coinbase/coinbase-sdk';
import { getCDPConfig, getBlockchainConfig } from './env';
import { ethers } from 'ethers';

// CDP Configuration from environment
const CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME || 'your_cdp_api_key_name_here';
const CDP_PRIVATE_KEY = process.env.CDP_PRIVATE_KEY || 'your_cdp_private_key_here';

// Only initialize Coinbase SDK if credentials are provided
let isSDKConfigured = false;
if (CDP_API_KEY_NAME !== 'your_cdp_api_key_name_here' && CDP_PRIVATE_KEY !== 'your_cdp_private_key_here') {
  try {
    Coinbase.configure({
      apiKeyName: CDP_API_KEY_NAME,
      privateKey: CDP_PRIVATE_KEY,
      useServerSigner: false
    });
    isSDKConfigured = true;
  } catch (error) {
    console.warn('CDP SDK configuration failed:', error);
  }
}

export interface RewardDistribution {
  id: string;
  recipient: string;
  amount: string; // in ETH
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  timestamp: number;
}

export interface CommunityPool {
  totalBalance: string; // in ETH
  weeklyDistribution: string; // in ETH
  lastDistribution: number; // timestamp
  nextDistribution: number; // timestamp
  pendingRewards: RewardDistribution[];
}

class CDPWalletService {
  private wallet: Wallet | null = null;
  private isInitialized = false;
  private communityPool: CommunityPool;
  private distributionHistory: RewardDistribution[] = [];

  constructor() {
    this.communityPool = {
      totalBalance: '0',
      weeklyDistribution: '0.1', // 0.1 ETH per week
      lastDistribution: 0,
      nextDistribution: Date.now() + (7 * 24 * 60 * 60 * 1000), // Next week
      pendingRewards: []
    };

    this.initializeWallet();
  }

  private async initializeWallet() {
    try {
      console.log('🏦 Initializing CDP Wallet Service...');

      if (!isSDKConfigured) {
        console.warn('CDP SDK not configured - using mock mode');
        this.isInitialized = true;
        return;
      }

      // Create or import wallet
      try {
        // Try different initialization methods based on SDK version
        let user;
        try {
          user = await Coinbase.getDefaultUser();
        } catch (error) {
          // Fallback for newer SDK versions
          console.log('Trying alternative user initialization...');
          // In newer versions, you might need to create user first
          // This is a fallback that should work with different SDK versions
          const wallets = await Wallet.listWallets();
          if (wallets && wallets.length > 0) {
            this.wallet = wallets[0];
            console.log('✅ Using existing CDP wallet');
          } else {
            this.wallet = await Wallet.create({
              networkId: 'base-mainnet' // Using Base for lower fees
            });
            console.log('✅ Created new CDP wallet');
          }
          await this.updateCommunityPoolBalance();
          this.isInitialized = true;
          console.log('🏦 CDP Wallet Service initialized successfully');
          this.scheduleWeeklyDistributions();
          return;
        }
        
        // Try to list existing wallets first
        const wallets = await user.listWallets();
        
        if (wallets.length > 0) {
          // Use existing wallet
          this.wallet = wallets[0];
          console.log('✅ Using existing CDP wallet');
        } else {
          // Create new wallet
          this.wallet = await user.createWallet({
            networkId: 'base-mainnet' // Using Base for lower fees
          });
          console.log('✅ Created new CDP wallet');
        }

        // Get wallet balance
        await this.updateCommunityPoolBalance();
        
        this.isInitialized = true;
        console.log('🏦 CDP Wallet Service initialized successfully');

        // Start weekly distribution scheduler
        this.scheduleWeeklyDistributions();

      } catch (apiError) {
        console.error('❌ CDP API error:', apiError);
        this.isInitialized = true; // Mark as initialized but in mock mode
      }

    } catch (error) {
      console.error('❌ Failed to initialize CDP wallet:', error);
      this.isInitialized = true; // Mark as initialized but in mock mode
    }
  }

  private async updateCommunityPoolBalance() {
    if (!this.wallet) return;

    try {
      const balance = await this.wallet.getBalance('ETH');
      this.communityPool.totalBalance = balance.toString();
      
      console.log(`💰 Community pool balance: ${this.communityPool.totalBalance} ETH`);
    } catch (error) {
      console.error('Error updating community pool balance:', error);
    }
  }

  private scheduleWeeklyDistributions() {
    // Check every hour for pending distributions
    setInterval(async () => {
      await this.checkAndExecuteWeeklyDistribution();
    }, 60 * 60 * 1000); // 1 hour

    // Also check immediately
    setTimeout(() => {
      this.checkAndExecuteWeeklyDistribution();
    }, 5000); // 5 seconds after initialization
  }

  private async checkAndExecuteWeeklyDistribution() {
    const now = Date.now();
    
    if (now >= this.communityPool.nextDistribution) {
      console.log('🗓️ Time for weekly reward distribution...');
      await this.executeWeeklyDistribution();
      
      // Set next distribution time
      this.communityPool.lastDistribution = now;
      this.communityPool.nextDistribution = now + (7 * 24 * 60 * 60 * 1000);
    }
  }

  private async executeWeeklyDistribution() {
    try {
      // Get top 3 users from Discord and Telegram
      const topUsers = await this.getTopCommunityUsers();
      
      if (topUsers.length === 0) {
        console.log('📊 No eligible users for weekly distribution');
        return;
      }

      const rewards = this.calculateWeeklyRewards(topUsers);
      
      for (const reward of rewards) {
        await this.distributeReward(reward);
      }

      console.log(`✅ Weekly distribution completed: ${rewards.length} rewards sent`);
      
    } catch (error) {
      console.error('❌ Error executing weekly distribution:', error);
    }
  }

  private async getTopCommunityUsers(): Promise<Array<{id: string, walletAddress?: string, points: number, platform: string}>> {
    // In a real implementation, this would fetch from Discord/Telegram bots
    // For now, return mock data structure
    
    // This should integrate with Discord and Telegram bot user databases
    const mockUsers = [
      { id: 'discord_123', walletAddress: '0x742d35Cc6634C0532925a3b8D8f1e2569b43b14f', points: 2500, platform: 'discord' },
      { id: 'telegram_456', walletAddress: '0x8ba1f109551bD432803012645Hac136c9c1e30f', points: 2200, platform: 'telegram' },
      { id: 'discord_789', walletAddress: '0x123f109551bD432803012645Hac136c9c1e30f', points: 1800, platform: 'discord' }
    ];

    // Filter users with connected wallets and sort by points
    return mockUsers
      .filter(user => user.walletAddress && user.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3); // Top 3 users
  }

  private calculateWeeklyRewards(topUsers: Array<{id: string, walletAddress?: string, points: number, platform: string}>): RewardDistribution[] {
    const rewards: RewardDistribution[] = [];
    const totalWeekly = parseFloat(this.communityPool.weeklyDistribution);
    
    // Distribution: 50% to 1st, 30% to 2nd, 20% to 3rd
    const percentages = [0.5, 0.3, 0.2];
    
    topUsers.forEach((user, index) => {
      if (index < 3 && user.walletAddress) {
        const amount = (totalWeekly * percentages[index]).toFixed(4);
        
        rewards.push({
          id: `weekly_${Date.now()}_${index}`,
          recipient: user.walletAddress,
          amount: amount,
          reason: `Weekly Top ${index + 1} - ${user.points} points (${user.platform})`,
          status: 'pending',
          timestamp: Date.now()
        });
      }
    });

    return rewards;
  }

  // Public methods for game integration

  public async distributeReward(reward: RewardDistribution): Promise<boolean> {
    if (!this.wallet || !this.isInitialized) {
      console.error('CDP wallet not initialized');
      return false;
    }

    try {
      console.log(`💸 Distributing ${reward.amount} ETH to ${reward.recipient}`);
      
      // Create and send transaction
      const transfer = await this.wallet.createTransfer({
        amount: reward.amount,
        assetId: 'ETH',
        destination: reward.recipient
      });

      // Wait for transaction to be broadcast
      await transfer.wait();
      
      reward.status = 'completed';
      reward.transactionHash = transfer.getTransactionHash();
      
      this.distributionHistory.push(reward);
      
      console.log(`✅ Reward distributed: ${reward.transactionHash}`);
      
      // Update community pool balance
      await this.updateCommunityPoolBalance();
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to distribute reward:', error);
      reward.status = 'failed';
      this.distributionHistory.push(reward);
      return false;
    }
  }

  public async distributeGameWinnings(roundId: string, winners: Array<{walletAddress: string, amount: number}>): Promise<boolean> {
    if (!this.wallet || !this.isInitialized) {
      console.error('CDP wallet not initialized');
      return false;
    }

    try {
      console.log(`🎮 Distributing game winnings for round ${roundId}`);
      
      for (const winner of winners) {
        if (winner.amount > 0 && winner.walletAddress.startsWith('0x')) {
          const reward: RewardDistribution = {
            id: `game_${roundId}_${Date.now()}`,
            recipient: winner.walletAddress,
            amount: winner.amount.toFixed(4),
            reason: `Game winnings - Round ${roundId}`,
            status: 'pending',
            timestamp: Date.now()
          };

          await this.distributeReward(reward);
        }
      }

      return true;
      
    } catch (error) {
      console.error('❌ Failed to distribute game winnings:', error);
      return false;
    }
  }

  public async fundCommunityPool(amount: string): Promise<boolean> {
    // This would be used to fund the community pool from external sources
    // For now, just log the intention
    console.log(`🏦 Community pool funding request: ${amount} ETH`);
    return true;
  }

  public getCommunityPoolInfo(): CommunityPool {
    return this.communityPool;
  }

  public getDistributionHistory(): RewardDistribution[] {
    return this.distributionHistory.slice(-50); // Last 50 distributions
  }

  public getWalletAddress(): string | null {
    if (!this.wallet) return null;
    
    try {
      const address = this.wallet.getDefaultAddress();
      return address?.getId() || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  public async getWalletBalance(): Promise<string> {
    if (!this.wallet) return '0';

    try {
      const balance = await this.wallet.getBalance('ETH');
      return balance.toString();
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }

  // Admin methods for manual distributions
  public async manualReward(walletAddress: string, amount: string, reason: string): Promise<boolean> {
    const reward: RewardDistribution = {
      id: `manual_${Date.now()}`,
      recipient: walletAddress,
      amount: amount,
      reason: reason,
      status: 'pending',
      timestamp: Date.now()
    };

    return await this.distributeReward(reward);
  }

  public async emergencyWithdraw(destinationAddress: string, amount: string): Promise<boolean> {
    if (!this.wallet || !this.isInitialized) {
      console.error('CDP wallet not initialized');
      return false;
    }

    try {
      console.log(`🚨 Emergency withdrawal: ${amount} ETH to ${destinationAddress}`);
      
      const transfer = await this.wallet.createTransfer({
        amount: amount,
        assetId: 'ETH',
        destination: destinationAddress
      });

      await transfer.wait();
      
      console.log(`✅ Emergency withdrawal completed: ${transfer.getTransactionHash()}`);
      
      // Update balance
      await this.updateCommunityPoolBalance();
      
      return true;
      
    } catch (error) {
      console.error('❌ Emergency withdrawal failed:', error);
      return false;
    }
  }

  public getStats() {
    return {
      isInitialized: this.isInitialized,
      walletAddress: this.getWalletAddress(),
      communityPool: this.communityPool,
      distributionCount: this.distributionHistory.length,
      lastDistribution: this.distributionHistory[this.distributionHistory.length - 1]
    };
  }
}

// Export singleton instance
export const cdpWalletService = new CDPWalletService();
export default cdpWalletService; 