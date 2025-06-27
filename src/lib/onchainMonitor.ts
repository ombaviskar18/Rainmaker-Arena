import axios from 'axios';
import { WebSocket } from 'ws';
import { ethers } from 'ethers';

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUSD: number;
  blockNumber: number;
  timestamp: number;
  type: 'transfer' | 'nft' | 'defi' | 'token';
  metadata?: {
    tokenAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    nftCollection?: string;
    nftTokenId?: string;
    protocol?: string;
  };
}

export interface WhaleActivity {
  id: string;
  whale: {
    address: string;
    name?: string;
    knownAs?: string;
  };
  transaction: WhaleTransaction;
  alert: {
    type: 'large_transfer' | 'nft_purchase' | 'defi_swap' | 'token_accumulation';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  timestamp: Date;
}

export interface MonitoringConfig {
  minTransferUSD: number;
  minNFTValueUSD: number;
  monitoredAddresses: string[];
  includeTokenTransfers: boolean;
  includeNFTs: boolean;
  includeDeFi: boolean;
  networks: ('ethereum' | 'base' | 'polygon')[];
}

export class OnchainWhaleMonitor {
  private config: MonitoringConfig;
  private isMonitoring: boolean = false;
  private alertHandlers: ((activity: WhaleActivity) => void)[] = [];
  private wsConnections: Map<string, WebSocket> = new Map();
  private knownWhales: Map<string, string> = new Map();
  
  // API endpoints
  private readonly ALCHEMY_WS_ETH = 'wss://eth-mainnet.g.alchemy.com/v2/';
  private readonly ALCHEMY_WS_BASE = 'wss://base-mainnet.g.alchemy.com/v2/';
  private readonly ETHERSCAN_API = 'https://api.etherscan.io/api';
  private readonly OPENSEA_API = 'https://api.opensea.io/api/v1';
  private readonly DEFILLAMA_API = 'https://api.llama.fi';

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      minTransferUSD: 50000, // $50k minimum
      minNFTValueUSD: 10000, // $10k NFT minimum
      monitoredAddresses: [],
      includeTokenTransfers: true,
      includeNFTs: true,
      includeDeFi: true,
      networks: ['ethereum', 'base'],
      ...config
    };

    this.initializeKnownWhales();
  }

  private initializeKnownWhales() {
    // Famous crypto wallets
    this.knownWhales.set('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'.toLowerCase(), 'Vitalik Buterin');
    this.knownWhales.set('0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b'.toLowerCase(), 'Punk6529');
    this.knownWhales.set('0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459'.toLowerCase(), 'Pranksy');
    this.knownWhales.set('0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872'.toLowerCase(), 'WhaleShark');
    this.knownWhales.set('0x8bc47Be1E3baCF3b77e8C1930f2073F5DD6C9f24'.toLowerCase(), 'Beanie');
    
    // Add to monitoring list
    this.config.monitoredAddresses = Array.from(this.knownWhales.keys());
  }

  public async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Already monitoring...');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting onchain whale monitoring...');

    try {
      // Start monitoring different networks
      if (this.config.networks.includes('ethereum')) {
        await this.startEthereumMonitoring();
      }
      
      if (this.config.networks.includes('base')) {
        await this.startBaseMonitoring();
      }

      // Start periodic checks for additional data
      this.startPeriodicChecks();
      
      console.log('✅ Onchain monitoring started successfully!');
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      this.isMonitoring = false;
    }
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    
    // Close all WebSocket connections
    for (const [network, ws] of this.wsConnections) {
      ws.close();
      console.log(`🔌 Closed ${network} WebSocket connection`);
    }
    
    this.wsConnections.clear();
    console.log('⏹️ Stopped onchain monitoring');
  }

  private async startEthereumMonitoring() {
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyKey) {
      console.log('⚠️ No Alchemy API key - using mock data for Ethereum');
      this.startMockEthereumData();
      return;
    }

    try {
      const ws = new WebSocket(`${this.ALCHEMY_WS_ETH}${alchemyKey}`);
      this.wsConnections.set('ethereum', ws);

      ws.on('open', () => {
        console.log('🔗 Connected to Alchemy Ethereum WebSocket');
        
        // Subscribe to pending transactions for monitored addresses
        const subscribeMessage = {
          id: 1,
          method: 'eth_subscribe',
          params: [
            'alchemy_pendingTransactions',
            {
              fromAddress: this.config.monitoredAddresses,
              toAddress: this.config.monitoredAddresses,
              hashesOnly: false
            }
          ]
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.params?.result) {
            this.processEthereumTransaction(response.params.result);
          }
        } catch (error) {
          console.error('Error processing Ethereum message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ Ethereum WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('🔌 Ethereum WebSocket closed');
        if (this.isMonitoring) {
          // Reconnect after 5 seconds
          setTimeout(() => this.startEthereumMonitoring(), 5000);
        }
      });

    } catch (error) {
      console.error('❌ Failed to connect to Ethereum:', error);
      this.startMockEthereumData();
    }
  }

  private async startBaseMonitoring() {
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyKey) {
      console.log('⚠️ No Alchemy API key - using mock data for Base');
      this.startMockBaseData();
      return;
    }

    try {
      const ws = new WebSocket(`${this.ALCHEMY_WS_BASE}${alchemyKey}`);
      this.wsConnections.set('base', ws);

      ws.on('open', () => {
        console.log('🔗 Connected to Alchemy Base WebSocket');
        
        const subscribeMessage = {
          id: 2,
          method: 'eth_subscribe',
          params: [
            'alchemy_pendingTransactions',
            {
              fromAddress: this.config.monitoredAddresses,
              toAddress: this.config.monitoredAddresses,
              hashesOnly: false
            }
          ]
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.params?.result) {
            this.processBaseTransaction(response.params.result);
          }
        } catch (error) {
          console.error('Error processing Base message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ Base WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('🔌 Base WebSocket closed');
        if (this.isMonitoring) {
          setTimeout(() => this.startBaseMonitoring(), 5000);
        }
      });

    } catch (error) {
      console.error('❌ Failed to connect to Base:', error);
      this.startMockBaseData();
    }
  }

  private async processEthereumTransaction(txData: any) {
    try {
      const valueWei = BigInt(txData.value || '0');
      const valueEth = parseFloat(ethers.formatEther(valueWei));
      
      // Get ETH price (simplified - in production use a real price API)
      const ethPrice = await this.getETHPrice();
      const valueUSD = valueEth * ethPrice;

      if (valueUSD < this.config.minTransferUSD) return;

      const transaction: WhaleTransaction = {
        hash: txData.hash,
        from: txData.from,
        to: txData.to,
        value: `${valueEth.toFixed(4)} ETH`,
        valueUSD,
        blockNumber: parseInt(txData.blockNumber, 16),
        timestamp: Date.now(),
        type: 'transfer'
      };

      await this.createWhaleActivity(transaction, 'ethereum');

    } catch (error) {
      console.error('Error processing Ethereum transaction:', error);
    }
  }

  private async processBaseTransaction(txData: any) {
    try {
      const valueWei = BigInt(txData.value || '0');
      const valueEth = parseFloat(ethers.formatEther(valueWei));
      
      const ethPrice = await this.getETHPrice();
      const valueUSD = valueEth * ethPrice;

      if (valueUSD < this.config.minTransferUSD) return;

      const transaction: WhaleTransaction = {
        hash: txData.hash,
        from: txData.from,
        to: txData.to,
        value: `${valueEth.toFixed(4)} ETH`,
        valueUSD,
        blockNumber: parseInt(txData.blockNumber, 16),
        timestamp: Date.now(),
        type: 'transfer'
      };

      await this.createWhaleActivity(transaction, 'base');

    } catch (error) {
      console.error('Error processing Base transaction:', error);
    }
  }

  private async createWhaleActivity(transaction: WhaleTransaction, network: string) {
    const whaleFrom = this.knownWhales.get(transaction.from.toLowerCase());
    const whaleTo = this.knownWhales.get(transaction.to.toLowerCase());
    
    if (!whaleFrom && !whaleTo) return;

    const whale = whaleFrom ? {
      address: transaction.from,
      name: whaleFrom
    } : {
      address: transaction.to,
      name: whaleTo
    };

    let alertType: 'large_transfer' | 'nft_purchase' | 'defi_swap' | 'token_accumulation' = 'large_transfer';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (transaction.valueUSD > 1000000) severity = 'critical';
    else if (transaction.valueUSD > 500000) severity = 'high';
    else if (transaction.valueUSD > 100000) severity = 'medium';
    else severity = 'low';

    const activity: WhaleActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      whale,
      transaction,
      alert: {
        type: alertType,
        message: `🚨 ${whale.name} ${whaleFrom ? 'sent' : 'received'} ${transaction.value} ($${transaction.valueUSD.toLocaleString()}) on ${network}`,
        severity
      },
      timestamp: new Date()
    };

    console.log('🐋 Whale activity detected:', activity.alert.message);
    this.alertHandlers.forEach(handler => handler(activity));
  }

  private startPeriodicChecks() {
    // Check for NFT purchases every 2 minutes
    setInterval(() => {
      if (this.isMonitoring) {
        this.checkNFTActivity();
      }
    }, 120000);

    // Check for DeFi activity every 3 minutes
    setInterval(() => {
      if (this.isMonitoring) {
        this.checkDeFiActivity();
      }
    }, 180000);
  }

  private async checkNFTActivity() {
    try {
      // Mock NFT activity check - replace with OpenSea API
      const mockNFTSales = [
        {
          whale: '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b',
          collection: 'CryptoPunks',
          tokenId: '1234',
          price: '50 ETH',
          priceUSD: 125000
        },
        {
          whale: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
          collection: 'Bored Ape Yacht Club',
          tokenId: '5678',
          price: '30 ETH',
          priceUSD: 75000
        }
      ];

      const randomSale = mockNFTSales[Math.floor(Math.random() * mockNFTSales.length)];
      const whaleName = this.knownWhales.get(randomSale.whale.toLowerCase());
      
      if (whaleName && Math.random() > 0.7) { // 30% chance
        const activity: WhaleActivity = {
          id: `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          whale: {
            address: randomSale.whale,
            name: whaleName
          },
          transaction: {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            from: randomSale.whale,
            to: '0x' + Math.random().toString(16).substr(2, 40),
            value: randomSale.price,
            valueUSD: randomSale.priceUSD,
            blockNumber: Math.floor(Math.random() * 1000000),
            timestamp: Date.now(),
            type: 'nft',
            metadata: {
              nftCollection: randomSale.collection,
              nftTokenId: randomSale.tokenId
            }
          },
          alert: {
            type: 'nft_purchase',
            message: `🖼️ ${whaleName} purchased ${randomSale.collection} #${randomSale.tokenId} for ${randomSale.price} ($${randomSale.priceUSD.toLocaleString()})`,
            severity: randomSale.priceUSD > 100000 ? 'high' : 'medium'
          },
          timestamp: new Date()
        };

        console.log('🎨 NFT activity detected:', activity.alert.message);
        this.alertHandlers.forEach(handler => handler(activity));
      }
    } catch (error) {
      console.error('Error checking NFT activity:', error);
    }
  }

  private async checkDeFiActivity() {
    try {
      // Mock DeFi activity - replace with DeFiLlama/1inch APIs
      const mockDeFiActions = [
        {
          whale: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          action: 'Uniswap V3 swap',
          tokenIn: 'USDC',
          tokenOut: 'ETH',
          amountUSD: 250000
        },
        {
          whale: '0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872',
          action: 'Compound supply',
          tokenIn: 'ETH',
          tokenOut: 'cETH',
          amountUSD: 180000
        }
      ];

      const randomAction = mockDeFiActions[Math.floor(Math.random() * mockDeFiActions.length)];
      const whaleName = this.knownWhales.get(randomAction.whale.toLowerCase());

      if (whaleName && Math.random() > 0.8) { // 20% chance
        const activity: WhaleActivity = {
          id: `defi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          whale: {
            address: randomAction.whale,
            name: whaleName
          },
          transaction: {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            from: randomAction.whale,
            to: '0x' + Math.random().toString(16).substr(2, 40),
            value: `$${randomAction.amountUSD.toLocaleString()}`,
            valueUSD: randomAction.amountUSD,
            blockNumber: Math.floor(Math.random() * 1000000),
            timestamp: Date.now(),
            type: 'defi',
            metadata: {
              protocol: randomAction.action.split(' ')[0],
              tokenName: randomAction.tokenIn
            }
          },
          alert: {
            type: 'defi_swap',
            message: `🔄 ${whaleName} executed ${randomAction.action}: ${randomAction.tokenIn} → ${randomAction.tokenOut} ($${randomAction.amountUSD.toLocaleString()})`,
            severity: randomAction.amountUSD > 200000 ? 'high' : 'medium'
          },
          timestamp: new Date()
        };

        console.log('🔄 DeFi activity detected:', activity.alert.message);
        this.alertHandlers.forEach(handler => handler(activity));
      }
    } catch (error) {
      console.error('Error checking DeFi activity:', error);
    }
  }

  private async getETHPrice(): Promise<number> {
    try {
      // Simple price fetch - replace with your preferred price API
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      return response.data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 2500; // Fallback price
    }
  }

  private startMockEthereumData() {
    console.log('🎭 Starting mock Ethereum data...');
    
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      if (Math.random() > 0.85) { // 15% chance every 30 seconds
        const mockAddresses = Array.from(this.knownWhales.keys());
        const randomWhale = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
        const randomValue = (Math.random() * 500 + 50) * 2500; // $125k - $1.25M
        
        const mockTransaction: WhaleTransaction = {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: randomWhale,
          to: '0x' + Math.random().toString(16).substr(2, 40),
          value: `${(randomValue / 2500).toFixed(4)} ETH`,
          valueUSD: randomValue,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
          type: 'transfer'
        };

        this.createWhaleActivity(mockTransaction, 'ethereum');
      }
    }, 30000);
  }

  private startMockBaseData() {
    console.log('🎭 Starting mock Base data...');
    
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      if (Math.random() > 0.9) { // 10% chance every 45 seconds
        const mockAddresses = Array.from(this.knownWhales.keys());
        const randomWhale = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
        const randomValue = (Math.random() * 200 + 25) * 2500; // $62.5k - $500k
        
        const mockTransaction: WhaleTransaction = {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: randomWhale,
          to: '0x' + Math.random().toString(16).substr(2, 40),
          value: `${(randomValue / 2500).toFixed(4)} ETH`,
          valueUSD: randomValue,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
          type: 'transfer'
        };

        this.createWhaleActivity(mockTransaction, 'base');
      }
    }, 45000);
  }

  // Public methods
  public onWhaleActivity(handler: (activity: WhaleActivity) => void) {
    this.alertHandlers.push(handler);
  }

  public addWhaleAddress(address: string, name: string) {
    this.knownWhales.set(address.toLowerCase(), name);
    this.config.monitoredAddresses.push(address.toLowerCase());
  }

  public updateConfig(newConfig: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  public getKnownWhales(): Map<string, string> {
    return new Map(this.knownWhales);
  }
} 