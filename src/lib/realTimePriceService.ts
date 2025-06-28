import { EventEmitter } from 'events';

// ⚠️  SECURITY: Use environment variables for sensitive data
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

if (!COINGECKO_API_KEY) {
  console.warn('⚠️  COINGECKO_API_KEY not found in environment variables. Using free tier.');
}

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
  market_cap: number;
  volume_24h: number;
}

export interface PredictionRound {
  id: string;
  crypto: string;
  startPrice: number;
  endPrice?: number;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  status: 'upcoming' | 'active' | 'ended';
  predictions: Prediction[];
}

export interface Prediction {
  id: string;
  userId: string;
  walletAddress: string;
  prediction: 'up' | 'down';
  betAmount: number; // in ETH
  timestamp: number;
  roundId: string;
}

export interface GameResult {
  roundId: string;
  winner: 'up' | 'down';
  startPrice: number;
  endPrice: number;
  totalPool: number;
  winners: Prediction[];
  payout: number;
}

class RealTimePriceService extends EventEmitter {
  private prices: Map<string, PriceData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private gameRounds: Map<string, PredictionRound> = new Map();
  private roundInterval: NodeJS.Timeout | null = null;
  
  // Supported cryptocurrencies with 4 chains
  private readonly SUPPORTED_CRYPTOS = [
    'bitcoin',
    'ethereum', 
    'chainlink',
    'matic-network',
    'uniswap',
    'avalanche-2', // Avalanche (AVAX)
    'solana', // Solana (SOL) 
    'cardano', // Cardano (ADA)
    'polkadot' // Polkadot (DOT)
  ];

  constructor() {
    super();
    this.initializePriceUpdates();
    this.initializeGameRounds();
  }

  private async initializePriceUpdates() {
    // Initial price fetch
    await this.fetchPrices();
    
    // Update prices every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.fetchPrices();
    }, 30000);
  }

  private initializeGameRounds() {
    // Create initial rounds for all cryptos
    this.createInitialRounds();
    
    // Create new rounds every 3 minutes to ensure active games
    this.roundInterval = setInterval(() => {
      this.createNewRoundsForAllCryptos();
    }, 3 * 60 * 1000); // 3 minutes
  }

  private async fetchPrices(): Promise<void> {
    try {
      // Prepare headers - only include API key if available
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      // Add API key header only if available
      if (COINGECKO_API_KEY && COINGECKO_API_KEY !== 'YOUR_COINGECKO_API_KEY_HERE') {
        headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
      }

      const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?ids=${this.SUPPORTED_CRYPTOS.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        { headers }
      );

      if (!response.ok) {
        console.warn(`CoinGecko API returned ${response.status}. Falling back to mock data.`);
        this.generateFallbackPrices();
        return;
      }

      const data = await response.json();
      
      // Transform the data
      for (const cryptoId of this.SUPPORTED_CRYPTOS) {
        if (data[cryptoId]) {
          const cryptoData = data[cryptoId];
          const priceData: PriceData = {
            id: cryptoId,
            symbol: this.getSymbol(cryptoId),
            name: this.getName(cryptoId),
            current_price: cryptoData.usd || 0,
            price_change_24h: cryptoData.usd_24h_change || 0,
            price_change_percentage_24h: cryptoData.usd_24h_change || 0,
            last_updated: new Date().toISOString(),
            market_cap: cryptoData.usd_market_cap || 0,
            volume_24h: cryptoData.usd_24h_vol || 0
          };
          
          this.prices.set(cryptoId, priceData);
        } else {
          // Add fallback/mock data for missing coins
          const mockPrice = this.generateMockPrice(cryptoId);
          this.prices.set(cryptoId, mockPrice);
        }
      }

      // Emit price update event
      this.emit('priceUpdate', Array.from(this.prices.values()));
      
      // Check for round endings
      this.checkRoundEndings();
      
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      console.log('Falling back to mock data for price prediction game...');
      this.generateFallbackPrices();
    }
  }

  private generateFallbackPrices(): void {
    // Generate realistic mock prices that update dynamically
    this.SUPPORTED_CRYPTOS.forEach(cryptoId => {
      const mockPrice = this.generateMockPrice(cryptoId);
      this.prices.set(cryptoId, mockPrice);
    });

    // Emit price update event with mock data
    this.emit('priceUpdate', Array.from(this.prices.values()));
    
    // Check for round endings
    this.checkRoundEndings();
  }

  private getSymbol(cryptoId: string): string {
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'chainlink': 'LINK',
      'matic-network': 'MATIC',
      'uniswap': 'UNI',
      'avalanche-2': 'AVAX',
      'solana': 'SOL',
      'cardano': 'ADA',
      'polkadot': 'DOT'
    };
    return symbolMap[cryptoId] || cryptoId.toUpperCase();
  }

  private getName(cryptoId: string): string {
    const nameMap: Record<string, string> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'chainlink': 'Chainlink',
      'matic-network': 'Polygon',
      'uniswap': 'Uniswap',
      'avalanche-2': 'Avalanche',
      'solana': 'Solana',
      'cardano': 'Cardano',
      'polkadot': 'Polkadot'
    };
    return nameMap[cryptoId] || cryptoId;
  }

  private createInitialRounds(): void {
    // Create a round for each supported crypto immediately
    this.SUPPORTED_CRYPTOS.forEach((cryptoId, index) => {
      // Stagger the start times by 10 seconds to avoid all ending at once
      setTimeout(() => {
        this.createRoundForCrypto(cryptoId);
      }, index * 10000);
    });
  }

  private createNewRoundsForAllCryptos(): void {
    // Check each crypto and create a new round if no active round exists
    this.SUPPORTED_CRYPTOS.forEach(cryptoId => {
      const hasActiveRound = Array.from(this.gameRounds.values())
        .some(round => round.crypto === cryptoId && round.status === 'active');
      
      if (!hasActiveRound) {
        this.createRoundForCrypto(cryptoId);
      }
    });
  }

  private createRoundForCrypto(cryptoId: string): void {
    const currentPrice = this.prices.get(cryptoId);
    
    if (!currentPrice) {
      return;
    }

    const roundId = `round_${Date.now()}_${cryptoId}`;
    const startTime = Date.now();
    const duration = 5 * 60; // 5 minutes in seconds
    const endTime = startTime + (duration * 1000);

    const round: PredictionRound = {
      id: roundId,
      crypto: cryptoId,
      startPrice: currentPrice.current_price,
      startTime,
      endTime,
      duration,
      status: 'active',
      predictions: []
    };

    this.gameRounds.set(roundId, round);
    
    // Emit new round event
    this.emit('newRound', round);
  }

  private checkRoundEndings(): void {
    const now = Date.now();
    
    for (const [roundId, round] of this.gameRounds.entries()) {
      if (round.status === 'active' && now >= round.endTime) {
        this.endRound(roundId);
      }
    }
  }

  private endRound(roundId: string): void {
    const round = this.gameRounds.get(roundId);
    if (!round) return;

    const currentPrice = this.prices.get(round.crypto);
    if (!currentPrice) {
      console.error(`Cannot end round ${roundId}: no current price for ${round.crypto}`);
      return;
    }

    round.endPrice = currentPrice.current_price;
    round.status = 'ended';

    // Determine winners
    const priceWentUp = round.endPrice > round.startPrice;
    const winningDirection = priceWentUp ? 'up' : 'down';
    const winners = round.predictions.filter(p => p.prediction === winningDirection);
    
    // Calculate total pool and payouts
    const totalPool = round.predictions.reduce((sum, p) => sum + p.betAmount, 0);
    const winnerPool = winners.reduce((sum, p) => sum + p.betAmount, 0);
    const payout = winnerPool > 0 ? totalPool / winnerPool : 0;

    const result: GameResult = {
      roundId,
      winner: winningDirection,
      startPrice: round.startPrice,
      endPrice: round.endPrice,
      totalPool,
      winners,
      payout
    };

    // Emit round ended event
    this.emit('roundEnded', result);
    
    // Remove old round after 1 hour
    setTimeout(() => {
      this.gameRounds.delete(roundId);
    }, 60 * 60 * 1000);
  }

  // Public methods
  public getPrices(): PriceData[] {
    return Array.from(this.prices.values());
  }

  public getPrice(cryptoId: string): PriceData | undefined {
    return this.prices.get(cryptoId);
  }

  public getActiveRounds(): PredictionRound[] {
    return Array.from(this.gameRounds.values()).filter(r => r.status === 'active');
  }

  public getRound(roundId: string): PredictionRound | undefined {
    return this.gameRounds.get(roundId);
  }

  public placePrediction(prediction: Omit<Prediction, 'id' | 'timestamp'>): boolean {
    const round = this.gameRounds.get(prediction.roundId);
    if (!round || round.status !== 'active') {
      return false;
    }

    // Check if round is still accepting predictions (must be at least 1 minute before end)
    const timeLeft = round.endTime - Date.now();
    if (timeLeft < 60000) { // Less than 1 minute left
      return false;
    }

    const newPrediction: Prediction = {
      ...prediction,
      id: `pred_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };

    round.predictions.push(newPrediction);
    
    // Emit prediction placed event
    this.emit('predictionPlaced', newPrediction);
    
    return true;
  }

  public getCurrentRoundForCrypto(cryptoId: string): PredictionRound | undefined {
    return Array.from(this.gameRounds.values())
      .find(r => r.crypto === cryptoId && r.status === 'active');
  }

  private generateMockPrice(cryptoId: string): PriceData {
    // Get previous price for realistic price movement
    const previousPrice = this.prices.get(cryptoId);
    
    // Generate realistic mock prices for demonstration
    const basePrice = {
      'bitcoin': 97000,
      'ethereum': 3400,
      'chainlink': 23.50,
      'matic-network': 0.42,
      'uniswap': 15.20,
      'avalanche-2': 40.50,
      'solana': 240.20,
      'cardano': 0.95,
      'polkadot': 8.80
    }[cryptoId] || 1.0;

    let currentPrice: number;
    
    if (previousPrice) {
      // Create realistic price movement from previous price
      const volatility = 0.02; // 2% max movement per update
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = previousPrice.current_price * (1 + change);
    } else {
      // Initial price with small variation
      const variation = (Math.random() - 0.5) * 0.05; // ±2.5%
      currentPrice = basePrice * (1 + variation);
    }

    // Calculate 24h change
    const change24h = (Math.random() - 0.5) * 0.15; // ±7.5%

    return {
      id: cryptoId,
      symbol: this.getSymbol(cryptoId),
      name: this.getName(cryptoId),
      current_price: parseFloat(currentPrice.toFixed(8)),
      price_change_24h: change24h * 100,
      price_change_percentage_24h: change24h * 100,
      last_updated: new Date().toISOString(),
      market_cap: currentPrice * 21000000, // More realistic market cap
      volume_24h: currentPrice * 100000 // More realistic volume
    };
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.roundInterval) {
      clearInterval(this.roundInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const realTimePriceService = new RealTimePriceService();
export default realTimePriceService; 