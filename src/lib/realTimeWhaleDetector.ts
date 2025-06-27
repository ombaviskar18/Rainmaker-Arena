import { EventEmitter } from 'events';

export interface WhaleWallet {
  address: string;
  name?: string;
  balance_eth: number;
  balance_usd: number;
  rank: number;
  last_activity: string;
  portfolio_value: number;
}

export interface RealWhaleActivity {
  id: string;
  whale_address: string;
  whale_name: string;
  activity_type: 'large_transfer' | 'nft_purchase' | 'defi_interaction' | 'token_swap' | 'donation';
  amount_eth: number;
  amount_usd: number;
  token_symbol?: string;
  nft_collection?: string;
  transaction_hash: string;
  timestamp: number;
  block_number: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

interface WhaleDetectorConfig {
  alchemyApiKey: string;
  etherscanApiKey: string;
  minTransactionUSD: number;
  updateInterval: number;
}

export class RealTimeWhaleDetector extends EventEmitter {
  private config: WhaleDetectorConfig;
  private isRunning = false;
  private whaleWallets: Map<string, WhaleWallet> = new Map();
  private priceCache: Map<string, number> = new Map();
  private lastBlockChecked = 0;

  // Top whale addresses from various sources (regularly updated)
  private readonly TOP_WHALE_ADDRESSES = [
    // Ethereum Foundation
    '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    // Vitalik Buterin
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    // Binance Hot Wallet
    '0x28C6c06298d514Db089934071355E5743bf21d60',
    // Coinbase Cold Storage
    '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
    // Kraken Exchange
    '0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0',
    // Unknown Whale 1
    '0x220866B1A2219f40e72f5c628B65D54268cA3A9D',
    // Unknown Whale 2
    '0x8103683202aa8DA10536036EDef04CDd865C225E',
    // Punk6529 (NFT Whale)
    '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b',
    // Pranksy (NFT Collector)
    '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
    // Whale Shark
    '0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872',
    // Large ETH Holder
    '0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489',
    // DeFi Whale
    '0x1919DB36cA2fa2e15C9BAe371A17F8c6B1e8DD1C',
    // Institutional Wallet
    '0x2FAF487A4414fE77e2327F0bf4AE2a264a776AD2',
    // Large Holder
    '0x742D35Cc6634C0532925a3b8D42C3cf1C3B7A9b1',
    // MEV Bot Whale
    '0x000000000dfDE7Deaf24138722987c9a6991e2D4'
  ];

  constructor(config: WhaleDetectorConfig) {
    super();
    this.config = config;
    this.initializePrices();
  }

  private async initializePrices() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      this.priceCache.set('ethereum', data.ethereum?.usd || 3000);
    } catch (error) {
      console.warn('Failed to fetch ETH price:', error);
      this.priceCache.set('ethereum', 3000);
    }
  }

  public async startDetection(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('🐋 Starting real-time whale detection...');
    this.isRunning = true;

    // First, fetch current whale data
    await this.updateWhaleWallets();
    
    // Get latest block number
    await this.updateLatestBlock();

    // Start monitoring for new transactions
    this.startTransactionMonitoring();

    // Periodically update whale wallet data
    setInterval(() => {
      if (this.isRunning) {
        this.updateWhaleWallets();
      }
    }, this.config.updateInterval);
  }

  private async updateWhaleWallets(): Promise<void> {
    console.log('📊 Updating whale wallet data...');
    
    for (const address of this.TOP_WHALE_ADDRESSES) {
      try {
        const balanceData = await this.getWalletBalance(address);
        if (balanceData) {
          this.whaleWallets.set(address, balanceData);
        }
      } catch (error) {
        console.error(`Failed to update wallet ${address}:`, error);
      }
    }

    console.log(`✅ Updated ${this.whaleWallets.size} whale wallets`);
  }

  private async getWalletBalance(address: string): Promise<WhaleWallet | null> {
    try {
      const response = await fetch(
        `https://eth-mainnet.g.alchemy.com/v2/${this.config.alchemyApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: [address, 'latest']
          })
        }
      );

      const data = await response.json();
      if (data.result) {
        const balanceWei = parseInt(data.result, 16);
        const balanceEth = balanceWei / 1e18;
        const ethPrice = this.priceCache.get('ethereum') || 3000;
        const balanceUsd = balanceEth * ethPrice;

        return {
          address,
          name: this.getWhaleName(address),
          balance_eth: balanceEth,
          balance_usd: balanceUsd,
          rank: this.calculateRank(balanceUsd),
          last_activity: new Date().toISOString(),
          portfolio_value: balanceUsd
        };
      }
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
    }

    return null;
  }

  private async updateLatestBlock(): Promise<void> {
    try {
      const response = await fetch(
        `https://eth-mainnet.g.alchemy.com/v2/${this.config.alchemyApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: []
          })
        }
      );

      const data = await response.json();
      if (data.result) {
        this.lastBlockChecked = parseInt(data.result, 16);
        console.log(`📦 Latest block: ${this.lastBlockChecked}`);
      }
    } catch (error) {
      console.error('Error fetching latest block:', error);
    }
  }

  private startTransactionMonitoring(): void {
    console.log('🔍 Starting real-time transaction monitoring...');
    
    // Poll for new blocks and check transactions
    setInterval(async () => {
      if (this.isRunning) {
        await this.checkNewTransactions();
      }
    }, 15000); // Check every 15 seconds
  }

  private async checkNewTransactions(): Promise<void> {
    try {
      // Get latest block
      const response = await fetch(
        `https://eth-mainnet.g.alchemy.com/v2/${this.config.alchemyApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockByNumber',
            params: ['latest', true]
          })
        }
      );

      const data = await response.json();
      if (data.result?.transactions) {
        const block = data.result;
        const currentBlock = parseInt(block.number, 16);
        
        if (currentBlock > this.lastBlockChecked) {
          await this.processBlockTransactions(block);
          this.lastBlockChecked = currentBlock;
        }
      }
    } catch (error) {
      console.error('Error checking new transactions:', error);
    }
  }

  private async processBlockTransactions(block: any): Promise<void> {
    const whaleAddresses = Array.from(this.whaleWallets.keys());
    
    for (const tx of block.transactions) {
      if (!tx.from || !tx.to || !tx.value) continue;
      
      const isWhaleTransaction = whaleAddresses.includes(tx.from.toLowerCase()) || 
                               whaleAddresses.includes(tx.to.toLowerCase());
      
      if (isWhaleTransaction) {
        const valueWei = parseInt(tx.value, 16);
        const valueEth = valueWei / 1e18;
        const ethPrice = this.priceCache.get('ethereum') || 3000;
        const valueUsd = valueEth * ethPrice;
        
        if (valueUsd >= this.config.minTransactionUSD) {
          const whaleActivity = await this.createWhaleActivity(tx, valueEth, valueUsd, block);
          if (whaleActivity) {
            this.emit('whaleActivity', whaleActivity);
            console.log(`🚨 WHALE ALERT: ${whaleActivity.description}`);
          }
        }
      }
    }
  }

  private async createWhaleActivity(tx: any, valueEth: number, valueUsd: number, block: any): Promise<RealWhaleActivity | null> {
    const whaleAddress = this.getWhaleInTransaction(tx.from, tx.to);
    if (!whaleAddress) return null;

    const whaleName = this.getWhaleName(whaleAddress);
    const activityType = this.determineActivityType(tx, valueUsd);
    const severity = this.calculateSeverity(valueUsd);
    const description = this.generateDescription(whaleName, activityType, valueEth, valueUsd);

    return {
      id: `whale_${tx.hash}_${Date.now()}`,
      whale_address: whaleAddress,
      whale_name: whaleName,
      activity_type: activityType,
      amount_eth: valueEth,
      amount_usd: valueUsd,
      transaction_hash: tx.hash,
      timestamp: parseInt(block.timestamp, 16) * 1000,
      block_number: parseInt(block.number, 16),
      severity,
      description
    };
  }

  private getWhaleInTransaction(from: string, to: string): string | null {
    const whaleAddresses = Array.from(this.whaleWallets.keys());
    return whaleAddresses.find(addr => 
      addr.toLowerCase() === from.toLowerCase() || 
      addr.toLowerCase() === to.toLowerCase()
    ) || null;
  }

  private determineActivityType(tx: any, valueUsd: number): RealWhaleActivity['activity_type'] {
    if (valueUsd > 1000000) return 'large_transfer';
    if (tx.to && tx.input && tx.input !== '0x') return 'defi_interaction';
    if (valueUsd > 100000) return 'token_swap';
    return 'large_transfer';
  }

  private calculateSeverity(valueUsd: number): RealWhaleActivity['severity'] {
    if (valueUsd >= 5000000) return 'critical';
    if (valueUsd >= 1000000) return 'high';
    if (valueUsd >= 100000) return 'medium';
    return 'low';
  }

  private generateDescription(whaleName: string, type: string, ethAmount: number, usdAmount: number): string {
    const formattedUsd = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(usdAmount);

    const formattedEth = ethAmount.toFixed(2);

    switch (type) {
      case 'large_transfer':
        return `${whaleName} moved ${formattedEth} ETH (${formattedUsd})`;
      case 'defi_interaction':
        return `${whaleName} executed DeFi transaction worth ${formattedUsd}`;
      case 'token_swap':
        return `${whaleName} swapped tokens worth ${formattedUsd}`;
      case 'nft_purchase':
        return `${whaleName} purchased NFT for ${formattedEth} ETH`;
      case 'donation':
        return `${whaleName} made donation of ${formattedEth} ETH`;
      default:
        return `${whaleName} activity: ${formattedEth} ETH (${formattedUsd})`;
    }
  }

  private getWhaleName(address: string): string {
    const names: { [key: string]: string } = {
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': 'Vitalik Buterin',
      '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance Hot Wallet',
      '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3': 'Coinbase Cold Storage',
      '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b': 'Punk6529',
      '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459': 'Pranksy',
      '0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872': 'WhaleShark',
      '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe': 'Ethereum Foundation'
    };

    return names[address] || `Whale ${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private calculateRank(balanceUsd: number): number {
    if (balanceUsd >= 100000000) return 1; // $100M+
    if (balanceUsd >= 50000000) return 2;  // $50M+
    if (balanceUsd >= 10000000) return 3;  // $10M+
    if (balanceUsd >= 5000000) return 4;   // $5M+
    if (balanceUsd >= 1000000) return 5;   // $1M+
    return 6;
  }

  public getWhaleWallets(): WhaleWallet[] {
    return Array.from(this.whaleWallets.values())
      .sort((a, b) => b.balance_usd - a.balance_usd);
  }

  public stopDetection(): void {
    this.isRunning = false;
    console.log('🛑 Whale detection stopped');
  }

  public isActive(): boolean {
    return this.isRunning;
  }
} 