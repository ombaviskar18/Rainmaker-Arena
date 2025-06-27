'use client';

// import axios from 'axios'; // For future API integration
import { WhaleHunterBot } from './xmtpBot';

export interface WhaleAlert {
  id: string;
  timestamp: Date;
  whale: {
    address: string;
    name?: string;
    knownAs?: string;
  };
  action: {
    type: 'large_transfer' | 'nft_purchase' | 'defi_swap' | 'token_mint';
    amount: string;
    token?: string;
    details: string;
    txHash?: string;
  };
  network: 'ethereum' | 'base' | 'polygon';
  value: number;
}

export interface WhaleTrigger {
  minValueUSD: number;
  includeNFTs: boolean;
  includeDeFi: boolean;
  includeTransfers: boolean;
  monitoredWallets: string[];
}

export class WhaleDetectionService {
  private bot: WhaleHunterBot;
  private isMonitoring: boolean = false;
  private triggers: WhaleTrigger;
  private knownWhales: Map<string, string> = new Map();
  private alertCallbacks: ((alert: WhaleAlert) => void)[] = [];

  constructor(bot: WhaleHunterBot) {
    this.bot = bot;
    this.triggers = {
      minValueUSD: 100000, // $100k minimum
      includeNFTs: true,
      includeDeFi: true,
      includeTransfers: true,
      monitoredWallets: []
    };

    this.initializeKnownWhales();
  }

  private initializeKnownWhales() {
    this.knownWhales.set('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'.toLowerCase(), 'Vitalik Buterin');
    this.knownWhales.set('0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b'.toLowerCase(), 'Punk6529');
    this.knownWhales.set('0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459'.toLowerCase(), 'Pranksy');
    
    // Add monitored wallets to triggers
    this.triggers.monitoredWallets = Array.from(this.knownWhales.keys());
  }

  public startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting whale detection monitoring...');
    
    // Start different monitoring streams
    this.monitorEthereumTransfers();
    this.monitorNFTActivity();
    this.monitorDeFiActivity();
    
    // Simulate some alerts for demo purposes
    this.startDemoAlerts();
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Stopped whale detection monitoring');
  }

  private async monitorEthereumTransfers() {
    // In a real implementation, you would use:
    // - Alchemy WebSocket API
    // - Etherscan API
    // - Moralis Streams
    // - QuickNode Streams
    
    console.log('📡 Monitoring Ethereum transfers...');
    
    // Mock implementation - replace with real WebSocket connection
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      try {
        // Simulate checking for large transfers
        const mockData = await this.fetchMockTransferData();
        if (mockData) {
          await this.processTransferAlert(mockData);
        }
      } catch (error) {
        console.error('Error monitoring transfers:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async monitorNFTActivity() {
    console.log('🖼️ Monitoring NFT activity...');
    
    // Mock NFT monitoring - replace with OpenSea API / Reservoir API
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      try {
        const mockData = await this.fetchMockNFTData();
        if (mockData) {
          await this.processNFTAlert(mockData);
        }
      } catch (error) {
        console.error('Error monitoring NFTs:', error);
      }
    }, 45000); // Check every 45 seconds
  }

  private async monitorDeFiActivity() {
    console.log('🔄 Monitoring DeFi activity...');
    
    // Mock DeFi monitoring - replace with DeFiLlama API / 1inch API
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      try {
        const mockData = await this.fetchMockDeFiData();
        if (mockData) {
          await this.processDeFiAlert(mockData);
        }
      } catch (error) {
        console.error('Error monitoring DeFi:', error);
      }
    }, 60000); // Check every minute
  }

  private startDemoAlerts() {
    // Send demo alerts every 2 minutes for testing
    setInterval(() => {
      if (!this.isMonitoring) return;
      this.sendDemoAlert();
    }, 120000);
  }

  private async sendDemoAlert() {
    const demoAlerts = [
      {
        whale: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        type: 'large_transfer' as const,
        amount: '500 ETH',
        details: 'Transferred 500 ETH to Coinbase'
      },
      {
        whale: '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b',
        type: 'nft_purchase' as const,
        amount: '100 ETH',
        details: 'Purchased CryptoPunk #1234'
      }
    ];

    const randomAlert = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    const whaleName = this.knownWhales.get(randomAlert.whale.toLowerCase()) || 'Unknown Whale';

    await this.bot.sendWhaleAlert({
      type: randomAlert.type,
      amount: randomAlert.amount,
      whale: whaleName,
      details: randomAlert.details
    });

    console.log('🚨 Sent whale alert:', whaleName, randomAlert.details);
  }

  private async fetchMockTransferData() {
    // Mock function - replace with real API calls
    if (Math.random() > 0.8) { // 20% chance of generating an alert
      return {
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to: '0x123...',
        amount: '250 ETH',
        value: 625000
      };
    }
    return null;
  }

  private async fetchMockNFTData() {
    // Mock function - replace with OpenSea/Reservoir API
    if (Math.random() > 0.9) { // 10% chance
      return {
        buyer: '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b',
        collection: 'CryptoPunks',
        tokenId: '1234',
        price: '50 ETH',
        value: 125000
      };
    }
    return null;
  }

  private async fetchMockDeFiData() {
    // Mock function - replace with DeFi protocol APIs
    if (Math.random() > 0.85) { // 15% chance
      return {
        user: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
        protocol: 'Uniswap V3',
        action: 'swap',
        amount: '500,000 USDC',
        value: 500000
      };
    }
    return null;
  }

  private async processTransferAlert(data: any) {
    const whaleName = this.knownWhales.get(data.from.toLowerCase());
    if (!whaleName || data.value < this.triggers.minValueUSD) return;

    const alert: WhaleAlert = {
      id: `transfer_${Date.now()}`,
      timestamp: new Date(),
      whale: {
        address: data.from,
        name: whaleName,
        knownAs: whaleName
      },
      action: {
        type: 'large_transfer',
        amount: data.amount,
        details: `Transferred ${data.amount} to ${data.to.slice(0, 6)}...`,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      },
      network: 'ethereum',
      value: data.value
    };

    await this.sendWhaleAlert(alert);
  }

  private async processNFTAlert(data: any) {
    const whaleName = this.knownWhales.get(data.buyer.toLowerCase());
    if (!whaleName || data.value < this.triggers.minValueUSD) return;

    const alert: WhaleAlert = {
      id: `nft_${Date.now()}`,
      timestamp: new Date(),
      whale: {
        address: data.buyer,
        name: whaleName,
        knownAs: whaleName
      },
      action: {
        type: 'nft_purchase',
        amount: data.price,
        details: `Purchased ${data.collection} #${data.tokenId}`,
        token: data.collection
      },
      network: 'ethereum',
      value: data.value
    };

    await this.sendWhaleAlert(alert);
  }

  private async processDeFiAlert(data: any) {
    const whaleName = this.knownWhales.get(data.user.toLowerCase());
    if (!whaleName || data.value < this.triggers.minValueUSD) return;

    const alert: WhaleAlert = {
      id: `defi_${Date.now()}`,
      timestamp: new Date(),
      whale: {
        address: data.user,
        name: whaleName,
        knownAs: whaleName
      },
      action: {
        type: 'defi_swap',
        amount: data.amount,
        details: `${data.action} on ${data.protocol}`,
        token: 'USDC'
      },
      network: 'ethereum',
      value: data.value
    };

    await this.sendWhaleAlert(alert);
  }

  private async sendWhaleAlert(alert: WhaleAlert) {
    console.log('🚨 WHALE ALERT:', alert);

    // Send to XMTP bot
    await this.bot.sendWhaleAlert({
      type: alert.action.type,
      amount: alert.action.amount,
      whale: alert.whale.name || 'Unknown Whale',
      details: alert.action.details
    });

    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alert));

    // Store alert for leaderboard/history
    this.storeAlert(alert);
  }

  private storeAlert(alert: WhaleAlert) {
    // In a real app, store in database
    const stored = localStorage.getItem('whaleAlerts') || '[]';
    const alerts = JSON.parse(stored);
    alerts.unshift(alert);
    
    // Keep only last 100 alerts
    const trimmed = alerts.slice(0, 100);
    localStorage.setItem('whaleAlerts', JSON.stringify(trimmed));
  }

  // Public API
  public onAlert(callback: (alert: WhaleAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  public updateTriggers(newTriggers: Partial<WhaleTrigger>) {
    this.triggers = { ...this.triggers, ...newTriggers };
    console.log('Updated whale detection triggers:', this.triggers);
  }

  public addWhaleAddress(address: string, name: string) {
    this.knownWhales.set(address.toLowerCase(), name);
    if (!this.triggers.monitoredWallets.includes(address.toLowerCase())) {
      this.triggers.monitoredWallets.push(address.toLowerCase());
    }
  }

  public getRecentAlerts(): WhaleAlert[] {
    const stored = localStorage.getItem('whaleAlerts') || '[]';
    return JSON.parse(stored);
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }
} 