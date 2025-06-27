import { EventEmitter } from 'events';

export interface WhaleTransaction {
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
  };
  nft?: {
    collection: string;
    tokenId: string;
    name: string;
  };
  timestamp: number;
  network: 'ethereum' | 'base' | 'polygon';
  type: 'transfer' | 'nft_purchase' | 'defi_swap' | 'token_accumulation';
}

export interface WhaleAlert {
  id: string;
  whale: string;
  action: string;
  amount: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  transaction: WhaleTransaction;
  whaleAddress: string;
}

interface WhaleMonitorConfig {
  alchemyApiKey?: string;
  etherscanApiKey?: string;
  coinGeckoApiKey?: string;
  minTransferUSD: number;
  networks: string[];
  whaleThreshold: number;
}

export class RealTimeWhaleMonitor extends EventEmitter {
  private config: WhaleMonitorConfig;
  private isActive = false;
  private websockets: WebSocket[] = [];
  private priceCache: Map<string, number> = new Map();
  private knownWhales: Map<string, string> = new Map();

  // Famous whale addresses with names
  private readonly FAMOUS_WHALES = new Map([
    ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik Buterin'],
    ['0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b', 'Punk6529'],
    ['0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459', 'Pranksy'],
    ['0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872', 'WhaleShark'],
    ['0x8bc47Be1E3baCF3b77e8C1930f2073F5DD6C9f24', 'Beanie'],
    ['0x50EC05ADe8280758E2077fcBC08D878D4aef79C3', 'NFT Collector'],
    ['0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00', 'Crypto Whale'],
    ['0x1919DB36cA2fa2e15C9BAe371A17F8c6B1e8DD1C', 'DeFi Whale'],
    ['0x8Ba1f109551bD432803012645Hac136c22C85A9C', 'Anonymous Whale'],
  ]);

  constructor(config: WhaleMonitorConfig) {
    super();
    this.config = config;
    this.knownWhales = new Map(this.FAMOUS_WHALES);
    this.initializePriceCache();
  }

  private async initializePriceCache() {
    try {
      // Fetch current ETH price from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,polygon&vs_currencies=usd',
        {
          headers: this.config.coinGeckoApiKey 
            ? { 'X-CG-Demo-API-Key': this.config.coinGeckoApiKey }
            : {}
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        this.priceCache.set('ethereum', data.ethereum?.usd || 2000);
        this.priceCache.set('bitcoin', data.bitcoin?.usd || 45000);
        this.priceCache.set('polygon', data.polygon?.usd || 0.8);
      }
    } catch (error) {
      console.warn('Failed to fetch prices, using fallback values:', error);
      // Fallback prices
      this.priceCache.set('ethereum', 2000);
      this.priceCache.set('bitcoin', 45000);
      this.priceCache.set('polygon', 0.8);
    }
  }

  public async startMonitoring(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🐋 Starting real-time whale monitoring...');

    // Start monitoring different networks
    if (this.config.networks.includes('ethereum')) {
      this.startEthereumMonitoring();
    }
    
    if (this.config.networks.includes('base')) {
      this.startBaseMonitoring();
    }

    // Start periodic whale activity simulation for demo
    this.startDemoWhaleActivity();
  }

  private startEthereumMonitoring() {
    if (!this.config.alchemyApiKey) {
      console.warn('No Alchemy API key provided, skipping Ethereum monitoring');
      return;
    }

    try {
      const wsUrl = `wss://eth-mainnet.g.alchemy.com/v2/${this.config.alchemyApiKey}`;
      console.log('🔗 Connecting to Ethereum WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Connected to Ethereum WebSocket');
        
        // Subscribe to pending transactions for large transfers
        ws.send(JSON.stringify({
          id: 1,
          method: "eth_subscribe",
          params: ["alchemy_pendingTransactions", {
            "toAddress": Array.from(this.knownWhales.keys()),
            "fromAddress": Array.from(this.knownWhales.keys())
          }]
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.params?.result) {
            this.processEthereumTransaction(data.params.result);
          }
        } catch (error) {
          console.error('Error processing Ethereum transaction:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Ethereum WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Ethereum WebSocket disconnected');
        // Reconnect after 5 seconds
        if (this.isActive) {
          setTimeout(() => this.startEthereumMonitoring(), 5000);
        }
      };

      this.websockets.push(ws);
    } catch (error) {
      console.error('Failed to start Ethereum monitoring:', error);
    }
  }

  private startBaseMonitoring() {
    // Base network monitoring (similar to Ethereum)
    console.log('📡 Starting Base network monitoring...');
    
    // For now, we'll simulate Base transactions
    setInterval(() => {
      if (this.isActive) {
        this.generateBaseWhaleActivity();
      }
    }, 30000); // Every 30 seconds
  }

  private async processEthereumTransaction(tx: any) {
    try {
      const value = parseInt(tx.value, 16);
      const ethValue = value / 1e18;
      const ethPrice = this.priceCache.get('ethereum') || 2000;
      const usdValue = ethValue * ethPrice;

      // Only process if above threshold
      if (usdValue < this.config.minTransferUSD) return;

      const whaleTransaction: WhaleTransaction = {
        id: `eth_${tx.hash}_${Date.now()}`,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethValue.toFixed(4),
        valueUSD: usdValue,
        timestamp: Date.now(),
        network: 'ethereum',
        type: this.determineTransactionType(tx, usdValue)
      };

      const alert = this.createWhaleAlert(whaleTransaction);
      if (alert) {
        this.emit('whaleAlert', alert);
        console.log('🚨 Whale Alert:', alert);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  private determineTransactionType(tx: any, usdValue: number): WhaleTransaction['type'] {
    // Simple heuristics to determine transaction type
    if (usdValue > 1000000) return 'token_accumulation';
    if (tx.to && tx.input && tx.input !== '0x') return 'defi_swap';
    return 'transfer';
  }

  private createWhaleAlert(transaction: WhaleTransaction): WhaleAlert | null {
    const fromWhale = this.knownWhales.get(transaction.from.toLowerCase());
    const toWhale = this.knownWhales.get(transaction.to.toLowerCase());
    
    if (!fromWhale && !toWhale) return null;

    const whale = fromWhale || toWhale || 'Unknown Whale';
    const whaleAddress = fromWhale ? transaction.from : transaction.to;
    
    const severity = this.determineSeverity(transaction.valueUSD);
    const action = this.generateActionDescription(transaction, whale);

    return {
      id: transaction.id,
      whale,
      action,
      amount: `$${(transaction.valueUSD / 1000).toFixed(1)}K`,
      severity,
      timestamp: 'Just now',
      transaction,
      whaleAddress
    };
  }

  private determineSeverity(usdValue: number): WhaleAlert['severity'] {
    if (usdValue >= 5000000) return 'critical';
    if (usdValue >= 1000000) return 'high';
    if (usdValue >= 500000) return 'medium';
    return 'low';
  }

  private generateActionDescription(tx: WhaleTransaction, whale: string): string {
    switch (tx.type) {
      case 'token_accumulation':
        return `Accumulated ${tx.value} ETH`;
      case 'defi_swap':
        return `DeFi interaction - ${tx.value} ETH`;
      case 'nft_purchase':
        return `Bought NFT for ${tx.value} ETH`;
      default:
        return `Transferred ${tx.value} ETH`;
    }
  }

  private startDemoWhaleActivity() {
    // Generate demo whale activities for demonstration
    const generateDemoActivity = () => {
      if (!this.isActive) return;

      const whales = Array.from(this.knownWhales.entries());
      const randomWhale = whales[Math.floor(Math.random() * whales.length)];
      
      const activities = [
        'Transferred large amount of ETH',
        'Bought expensive NFT',
        'Made DeFi swap',
        'Accumulated tokens',
        'Staked in protocol'
      ];

      const amounts = [50, 100, 250, 500, 1000, 2500];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      const demoTransaction: WhaleTransaction = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: randomWhale[0],
        to: '0x' + Math.random().toString(16).substr(2, 40),
        value: (amount / this.priceCache.get('ethereum')!).toFixed(4),
        valueUSD: amount * 1000,
        timestamp: Date.now(),
        network: Math.random() > 0.5 ? 'ethereum' : 'base',
        type: 'transfer'
      };

      const alert: WhaleAlert = {
        id: demoTransaction.id,
        whale: randomWhale[1],
        action: activity,
        amount: `$${amount}K`,
        severity: amount >= 1000 ? 'critical' : amount >= 500 ? 'high' : amount >= 250 ? 'medium' : 'low',
        timestamp: 'Just now',
        transaction: demoTransaction,
        whaleAddress: randomWhale[0]
      };

      this.emit('whaleAlert', alert);
    };

    // Generate demo activity every 10-20 seconds
    const scheduleNext = () => {
      if (this.isActive) {
        const delay = Math.random() * 10000 + 10000; // 10-20 seconds
        setTimeout(() => {
          generateDemoActivity();
          scheduleNext();
        }, delay);
      }
    };

    scheduleNext();
  }

  private generateBaseWhaleActivity() {
    const whales = Array.from(this.knownWhales.entries());
    const randomWhale = whales[Math.floor(Math.random() * whales.length)];
    
    const baseActivities = [
      'Bridge from Ethereum',
      'Swap on Base DEX',
      'Mint Base NFT',
      'Provide liquidity',
      'Stake tokens'
    ];

    const amounts = [25, 50, 100, 200, 500];
    const activity = baseActivities[Math.floor(Math.random() * baseActivities.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    const baseTransaction: WhaleTransaction = {
      id: `base_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: randomWhale[0],
      to: '0x' + Math.random().toString(16).substr(2, 40),
      value: (amount / this.priceCache.get('ethereum')!).toFixed(4),
      valueUSD: amount * 1000,
      timestamp: Date.now(),
      network: 'base',
      type: 'defi_swap'
    };

    const alert: WhaleAlert = {
      id: baseTransaction.id,
      whale: randomWhale[1],
      action: activity,
      amount: `$${amount}K`,
      severity: amount >= 200 ? 'high' : amount >= 100 ? 'medium' : 'low',
      timestamp: 'Just now',
      transaction: baseTransaction,
      whaleAddress: randomWhale[0]
    };

    this.emit('whaleAlert', alert);
  }

  public stopMonitoring(): void {
    this.isActive = false;
    this.websockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.websockets = [];
    console.log('🛑 Whale monitoring stopped');
  }

  public isMonitoringActive(): boolean {
    return this.isActive;
  }

  public getKnownWhales(): Map<string, string> {
    return new Map(this.knownWhales);
  }

  public addWhale(address: string, name: string): void {
    this.knownWhales.set(address.toLowerCase(), name);
  }
} 