import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk';
import { EventEmitter } from 'events';
import { getBlockchainConfig } from './env';

export interface OnchainWhaleTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUSD: number;
  token?: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  nft?: {
    collection: string;
    tokenId: string;
    name: string;
    floorPrice?: number;
  };
  timestamp: number;
  network: 'ethereum' | 'base' | 'polygon';
  type: 'eth_transfer' | 'token_transfer' | 'nft_transfer' | 'defi_interaction';
  gasUsed?: string;
  gasPrice?: string;
}

export interface WhaleWallet {
  address: string;
  name: string;
  tags: string[];
  estimatedNetWorth?: number;
  lastActivity: number;
}

export interface OnchainWhaleAlert {
  id: string;
  whale: WhaleWallet;
  transaction: OnchainWhaleTransaction;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alertType: 'large_transfer' | 'nft_purchase' | 'defi_activity' | 'unusual_pattern';
  description: string;
  timestamp: number;
}

export class OnchainWhaleMonitor extends EventEmitter {
  private alchemy: Alchemy | null = null;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastProcessedBlock: { [network: string]: number } = {};
  private ethPrice = 2000; // Will be updated from API
  private priceCache: Map<string, number> = new Map();
  
  // Famous whale wallets to monitor
  private readonly WHALE_WALLETS: Map<string, WhaleWallet> = new Map([
    ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', {
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      name: 'Vitalik Buterin',
      tags: ['ethereum-founder', 'charitable-donor', 'developer'],
      lastActivity: Date.now()
    }],
    ['0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', {
      address: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
      name: 'Punk6529',
      tags: ['nft-collector', 'metaverse-advocate', 'influencer'],
      lastActivity: Date.now()
    }],
    ['0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459', {
      address: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
      name: 'Pranksy',
      tags: ['nft-trader', 'early-adopter', 'collector'],
      lastActivity: Date.now()
    }],
    ['0x020ca66c30bec2c4fe3861a94e4db4a498a35872', {
      address: '0x020ca66c30bec2c4fe3861a94e4db4a498a35872',
      name: 'WhaleShark',
      tags: ['nft-collector', 'social-token-creator', 'whale-token'],
      lastActivity: Date.now()
    }],
    ['0x8bc47be1e3bacf3b77e8c1930f2073f5dd6c9f24', {
      address: '0x8bc47be1e3bacf3b77e8c1930f2073f5dd6c9f24',
      name: 'Beanie',
      tags: ['nft-buyer', 'dao-founder', 'high-spender'],
      lastActivity: Date.now()
    }]
  ]);

  constructor() {
    super();
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      console.log('🔄 Initializing onchain whale monitoring...');
      
      const config = getBlockchainConfig();
      
      if (config.alchemyApiKey) {
        this.alchemy = new Alchemy({
          apiKey: config.alchemyApiKey,
          network: Network.ETH_MAINNET,
        });
        console.log('✅ Alchemy SDK initialized');
      } else {
        console.warn('⚠️ No Alchemy API key found, using demo mode');
      }

      // Initialize price data
      await this.updatePrices();
      
      console.log('✅ Onchain whale monitor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize onchain monitor:', error);
    }
  }

  private async updatePrices() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd'
      );
      
      if (response.ok) {
        const data = await response.json();
        this.ethPrice = data.ethereum?.usd || 2000;
        this.priceCache.set('ethereum', this.ethPrice);
        this.priceCache.set('bitcoin', data.bitcoin?.usd || 45000);
        console.log(`💰 Price updated: ETH = $${this.ethPrice}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to update prices, using cached values');
    }
  }

  public async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚀 Starting onchain whale monitoring...');

    // Update prices periodically
    setInterval(() => this.updatePrices(), 60000); // Every minute

    if (this.alchemy) {
      // Monitor real blockchain data
      await this.startRealMonitoring();
    } else {
      // Fallback to simulated monitoring for demo
      this.startSimulatedMonitoring();
    }
  }

  private async startRealMonitoring() {
    console.log('📡 Starting real-time blockchain monitoring...');
    
    try {
      // Get latest block number
      const latestBlock = await this.alchemy!.core.getBlockNumber();
      this.lastProcessedBlock['ethereum'] = latestBlock;
      
      // Check for whale transactions every 30 seconds
      this.monitoringInterval = setInterval(async () => {
        await this.checkForWhaleActivity();
      }, 30000);

      // Also do an initial check
      await this.checkForWhaleActivity();
      
    } catch (error) {
      console.error('❌ Failed to start real monitoring:', error);
      this.startSimulatedMonitoring();
    }
  }

  private async checkForWhaleActivity() {
    try {
      const currentBlock = await this.alchemy!.core.getBlockNumber();
      const fromBlock = this.lastProcessedBlock['ethereum'] || currentBlock - 10;
      
      console.log(`🔍 Checking blocks ${fromBlock} to ${currentBlock} for whale activity...`);

      // Check asset transfers for our whale wallets
      for (const [address, whale] of this.WHALE_WALLETS) {
        await this.checkWalletActivity(whale, fromBlock, currentBlock);
      }

      this.lastProcessedBlock['ethereum'] = currentBlock;
      
    } catch (error) {
      console.error('❌ Error checking whale activity:', error);
    }
  }

  private async checkWalletActivity(whale: WhaleWallet, fromBlock: number, toBlock: number) {
    try {
      // Check outgoing transfers
      const outgoingTransfers = await this.alchemy!.core.getAssetTransfers({
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
        fromAddress: whale.address,
        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721],
        withMetadata: true,
      });

      // Check incoming transfers
      const incomingTransfers = await this.alchemy!.core.getAssetTransfers({
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
        toAddress: whale.address,
        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721],
        withMetadata: true,
      });

      // Process transfers
      const allTransfers = [...outgoingTransfers.transfers, ...incomingTransfers.transfers];
      
      for (const transfer of allTransfers) {
        await this.processTransfer(whale, transfer);
      }

    } catch (error) {
      console.error(`❌ Error checking wallet ${whale.name}:`, error);
    }
  }

  private async processTransfer(whale: WhaleWallet, transfer: any) {
    try {
      const value = parseFloat(transfer.value || '0');
      const valueUSD = value * this.ethPrice;

      // Only process significant transfers (> $10K)
      if (valueUSD < 10000) return;

      const transaction: OnchainWhaleTransaction = {
        id: `${transfer.hash}_${Date.now()}`,
        hash: transfer.hash,
        from: transfer.from,
        to: transfer.to || '',
        value: value.toString(),
        valueUSD,
        timestamp: Date.now(),
        network: 'ethereum',
        type: this.getTransactionType(transfer)
      };

      // Add token info if available
      if (transfer.asset && transfer.asset !== 'ETH') {
        transaction.token = {
          symbol: transfer.asset,
          name: transfer.asset,
          address: transfer.rawContract?.address || '',
          decimals: 18
        };
      }

      // Create whale alert
      const alert = this.createWhaleAlert(whale, transaction);
      if (alert) {
        console.log(`🚨 Whale alert: ${whale.name} - ${alert.description}`);
        this.emit('whaleAlert', alert);
      }

    } catch (error) {
      console.error('❌ Error processing transfer:', error);
    }
  }

  private getTransactionType(transfer: any): OnchainWhaleTransaction['type'] {
    if (transfer.category === 'erc721') return 'nft_transfer';
    if (transfer.category === 'erc20') return 'token_transfer';
    return 'eth_transfer';
  }

  private createWhaleAlert(whale: WhaleWallet, transaction: OnchainWhaleTransaction): OnchainWhaleAlert | null {
    const severity = this.calculateSeverity(transaction.valueUSD);
    if (severity === 'low') return null;

    const alertType = this.determineAlertType(transaction);
    const description = this.generateAlertDescription(whale, transaction, alertType);

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      whale,
      transaction,
      severity,
      alertType,
      description,
      timestamp: Date.now()
    };
  }

  private calculateSeverity(valueUSD: number): OnchainWhaleAlert['severity'] {
    if (valueUSD >= 1000000) return 'critical'; // $1M+
    if (valueUSD >= 500000) return 'high';      // $500K+
    if (valueUSD >= 100000) return 'medium';    // $100K+
    return 'low';
  }

  private determineAlertType(transaction: OnchainWhaleTransaction): OnchainWhaleAlert['alertType'] {
    if (transaction.type === 'nft_transfer') return 'nft_purchase';
    if (transaction.valueUSD >= 500000) return 'large_transfer';
    return 'defi_activity';
  }

  private generateAlertDescription(whale: WhaleWallet, transaction: OnchainWhaleTransaction, alertType: OnchainWhaleAlert['alertType']): string {
    const amount = `$${(transaction.valueUSD / 1000).toFixed(0)}K`;
    
    switch (alertType) {
      case 'large_transfer':
        return `${whale.name} transferred ${amount} worth of ${transaction.token?.symbol || 'ETH'}`;
      case 'nft_purchase':
        return `${whale.name} acquired NFT worth ${amount}`;
      default:
        return `${whale.name} made a ${amount} transaction`;
    }
  }

  private startSimulatedMonitoring() {
    console.log('🎭 Starting simulated whale monitoring for demo...');
    
    const generateSimulatedActivity = () => {
      const whales = Array.from(this.WHALE_WALLETS.values());
      const randomWhale = whales[Math.floor(Math.random() * whales.length)];
      
      const activities = [
        { action: 'Large ETH transfer', amount: 1000 + Math.random() * 4000, type: 'eth_transfer' },
        { action: 'NFT acquisition', amount: 100 + Math.random() * 900, type: 'nft_transfer' },
        { action: 'Token swap', amount: 500 + Math.random() * 2000, type: 'token_transfer' },
        { action: 'DeFi interaction', amount: 200 + Math.random() * 1500, type: 'defi_interaction' }
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const valueUSD = activity.amount * 1000; // Convert to USD
      
      const transaction: OnchainWhaleTransaction = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: randomWhale.address,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (valueUSD / this.ethPrice).toFixed(4),
        valueUSD,
        timestamp: Date.now(),
        network: 'ethereum',
        type: activity.type as OnchainWhaleTransaction['type']
      };

      const alert = this.createWhaleAlert(randomWhale, transaction);
      if (alert) {
        console.log(`🎭 Simulated alert: ${alert.description}`);
        this.emit('whaleAlert', alert);
      }
    };

    // Generate activity every 30-90 seconds for demo
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 60000; // 30-90 seconds
      setTimeout(() => {
        if (this.isMonitoring) {
          generateSimulatedActivity();
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Onchain whale monitoring stopped');
  }

  public getWhaleWallets(): Map<string, WhaleWallet> {
    return this.WHALE_WALLETS;
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  public addWhaleWallet(address: string, name: string, tags: string[] = []) {
    const wallet: WhaleWallet = {
      address: address.toLowerCase(),
      name,
      tags,
      lastActivity: Date.now()
    };
    
    this.WHALE_WALLETS.set(address.toLowerCase(), wallet);
    console.log(`✅ Added whale wallet: ${name} (${address})`);
  }

  public async getWalletBalance(address: string): Promise<{ eth: number; usd: number } | null> {
    if (!this.alchemy) return null;
    
    try {
      const balance = await this.alchemy.core.getBalance(address);
      const ethBalance = parseFloat(balance.toString()) / 1e18;
      const usdBalance = ethBalance * this.ethPrice;
      
      return { eth: ethBalance, usd: usdBalance };
    } catch (error) {
      console.error('❌ Error getting wallet balance:', error);
      return null;
    }
  }

  public async getRecentTransactions(address: string, limit = 10): Promise<OnchainWhaleTransaction[]> {
    if (!this.alchemy) return [];
    
    try {
      const transfers = await this.alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
        maxCount: limit,
        order: 'desc'
      });
      
      return transfers.transfers.map(transfer => ({
        id: transfer.hash,
        hash: transfer.hash,
        from: transfer.from,
        to: transfer.to || '',
        value: transfer.value?.toString() || '0',
        valueUSD: parseFloat(transfer.value || '0') * this.ethPrice,
        timestamp: Date.now(), // Would parse from block timestamp in real implementation
        network: 'ethereum' as const,
        type: 'eth_transfer' as const
      }));
      
    } catch (error) {
      console.error('❌ Error getting recent transactions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const onchainWhaleMonitor = new OnchainWhaleMonitor(); 