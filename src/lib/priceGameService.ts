import { ethers } from 'ethers';
import { getChainlinkConfig, getBlockchainConfig, getGameShowConfig } from './env';
import { cdpWalletService } from './cdpWalletService';

// Chainlink Price Feed ABI (simplified)
const CHAINLINK_ABI = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      { "internalType": "uint80", "name": "roundId", "type": "uint80" },
      { "internalType": "int256", "name": "answer", "type": "int256" },
      { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
      { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface CryptoPair {
  symbol: string;
  name: string;
  feedAddress: string;
  decimals: number;
  currentPrice: number;
  lastUpdated: Date;
}

export interface GamePrediction {
  id: string;
  userId: string;
  userAddress: string;
  cryptoPair: string;
  currentPrice: number;
  predictedPrice: number;
  betAmount: number;
  predictionTime: Date;
  resolveTime: Date;
  actualPrice?: number;
  isCorrect?: boolean;
  payoutAmount?: number;
  payoutTxHash?: string;
  status: 'pending' | 'resolved' | 'paid' | 'failed';
}

export interface GameRound {
  id: string;
  roundNumber: number;
  cryptoPair: string;
  startTime: Date;
  endTime: Date;
  startPrice: number;
  endPrice?: number;
  totalBets: number;
  totalPlayers: number;
  predictions: GamePrediction[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export interface PriceMovement {
  direction: 'up' | 'down';
  percentage: number;
  confidence: number;
}

export class PriceGameService {
  private provider: ethers.JsonRpcProvider;
  private priceFeeds: Map<string, ethers.Contract> = new Map();
  private activeRounds: Map<string, GameRound> = new Map();
  private priceCache: Map<string, CryptoPair> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    const chainlinkConfig = getChainlinkConfig();
    const blockchainConfig = getBlockchainConfig();
    
    // Initialize Ethereum provider
    this.provider = new ethers.JsonRpcProvider(
      chainlinkConfig.ethereumRpc || blockchainConfig.ethereum.rpcUrl
    );
    
    this.initializePriceFeeds();
    this.startPriceUpdates();
    this.scheduleGameRounds();
  }

  /**
   * Initialize Chainlink price feed contracts
   */
  private initializePriceFeeds(): void {
    const chainlinkConfig = getChainlinkConfig();
    
    const cryptoPairs: Array<{ symbol: string; name: string; address: string }> = [
      { symbol: 'BTC-USD', name: 'Bitcoin', address: chainlinkConfig.priceFeeds.btcUsd },
      { symbol: 'ETH-USD', name: 'Ethereum', address: chainlinkConfig.priceFeeds.ethUsd },
      { symbol: 'LINK-USD', name: 'Chainlink', address: chainlinkConfig.priceFeeds.linkUsd },
      { symbol: 'MATIC-USD', name: 'Polygon', address: chainlinkConfig.priceFeeds.maticUsd },
      { symbol: 'UNI-USD', name: 'Uniswap', address: chainlinkConfig.priceFeeds.uniUsd },
    ];

    for (const pair of cryptoPairs) {
      const contract = new ethers.Contract(pair.address, CHAINLINK_ABI, this.provider);
      this.priceFeeds.set(pair.symbol, contract);
      
      // Initialize price cache
      this.priceCache.set(pair.symbol, {
        symbol: pair.symbol,
        name: pair.name,
        feedAddress: pair.address,
        decimals: 8, // Default, will be updated
        currentPrice: 0,
        lastUpdated: new Date(),
      });
    }

    console.log(`📊 Initialized ${cryptoPairs.length} Chainlink price feeds`);
  }

  /**
   * Start periodic price updates
   */
  private startPriceUpdates(): void {
    // Update prices every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateAllPrices().catch(console.error);
    }, 30000);

    // Initial update
    this.updateAllPrices().catch(console.error);
  }

  /**
   * Update all price feeds
   */
  async updateAllPrices(): Promise<void> {
    const promises = Array.from(this.priceFeeds.keys()).map(symbol => 
      this.updatePrice(symbol)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Update price for a specific crypto pair
   */
  async updatePrice(symbol: string): Promise<number> {
    try {
      const contract = this.priceFeeds.get(symbol);
      if (!contract) {
        throw new Error(`Price feed not found for ${symbol}`);
      }

      const [roundId, price, startedAt, updatedAt, answeredInRound] = 
        await contract.latestRoundData();
      
      const decimals = await contract.decimals();
      const formattedPrice = parseFloat(ethers.formatUnits(price, decimals));

      // Update cache
      const cachedPair = this.priceCache.get(symbol);
      if (cachedPair) {
        cachedPair.currentPrice = formattedPrice;
        cachedPair.decimals = decimals;
        cachedPair.lastUpdated = new Date(Number(updatedAt) * 1000);
      }

      console.log(`💰 ${symbol}: $${formattedPrice.toFixed(2)}`);
      return formattedPrice;
    } catch (error) {
      console.error(`Failed to update price for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Get current price for a crypto pair
   */
  getCurrentPrice(symbol: string): CryptoPair | null {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Get all available crypto pairs
   */
  getAllPairs(): CryptoPair[] {
    return Array.from(this.priceCache.values());
  }

  /**
   * Create a new price prediction
   */
  async createPrediction(
    userId: string,
    userAddress: string,
    cryptoPair: string,
    predictedPrice: number,
    betAmount: number,
    timeframe: number = 300 // 5 minutes default
  ): Promise<GamePrediction> {
    const gameConfig = getGameShowConfig();
    
    // Validate bet amount
    if (betAmount < gameConfig.minBet || betAmount > gameConfig.maxBet) {
      throw new Error(`Bet amount must be between $${gameConfig.minBet} and $${gameConfig.maxBet}`);
    }

    const currentPair = this.getCurrentPrice(cryptoPair);
    if (!currentPair) {
      throw new Error(`Price feed not available for ${cryptoPair}`);
    }

    const prediction: GamePrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userAddress,
      cryptoPair,
      currentPrice: currentPair.currentPrice,
      predictedPrice,
      betAmount,
      predictionTime: new Date(),
      resolveTime: new Date(Date.now() + timeframe * 1000),
      status: 'pending',
    };

    console.log(`🎯 New prediction: ${userId} bets $${betAmount} that ${cryptoPair} will be $${predictedPrice}`);

    // Schedule resolution
    setTimeout(() => {
      this.resolvePrediction(prediction.id).catch(console.error);
    }, timeframe * 1000);

    return prediction;
  }

  /**
   * Resolve a price prediction
   */
  async resolvePrediction(predictionId: string): Promise<void> {
    // In a real implementation, you'd fetch from database
    // For demo, we'll simulate
    
    const prediction = await this.getPredictionById(predictionId);
    if (!prediction || prediction.status !== 'pending') {
      return;
    }

    // Get current price
    const currentPrice = await this.updatePrice(prediction.cryptoPair);
    prediction.actualPrice = currentPrice;

    // Determine if prediction was correct (within 2% tolerance)
    const tolerance = 0.02; // 2%
    const priceChange = Math.abs(currentPrice - prediction.predictedPrice) / prediction.predictedPrice;
    prediction.isCorrect = priceChange <= tolerance;

    // Calculate payout
    if (prediction.isCorrect) {
      // Winner gets 1.8x their bet (minus platform fee)
      const multiplier = 1.8;
      const platformFee = getGameShowConfig().bettingFeePercentage / 100;
      prediction.payoutAmount = prediction.betAmount * multiplier * (1 - platformFee);

      // Process payout via CDP wallet
      try {
        const txHash = await cdpWalletService.processGamePayout(
          prediction.userId,
          prediction.userAddress,
          prediction.payoutAmount / 1000, // Convert to ETH (assuming 1 ETH = $1000 for demo)
          'price_prediction'
        );

        if (txHash) {
          prediction.payoutTxHash = txHash;
          prediction.status = 'paid';
        } else {
          prediction.status = 'failed';
        }
      } catch (error) {
        console.error('Failed to process payout:', error);
        prediction.status = 'failed';
      }
    } else {
      prediction.payoutAmount = 0;
      prediction.status = 'resolved';
    }

    console.log(`🎲 Prediction resolved: ${prediction.isCorrect ? '✅ WIN' : '❌ LOSS'} - ${prediction.cryptoPair} actual: $${currentPrice.toFixed(2)}, predicted: $${prediction.predictedPrice.toFixed(2)}`);
  }

  /**
   * Schedule automatic game rounds
   */
  private scheduleGameRounds(): void {
    const gameConfig = getGameShowConfig();
    const roundInterval = (24 * 60 * 60 * 1000) / gameConfig.roundsPerDay; // milliseconds between rounds

    setInterval(() => {
      this.createGameRound().catch(console.error);
    }, roundInterval);

    // Create initial round
    this.createGameRound().catch(console.error);
  }

  /**
   * Create a new game round
   */
  async createGameRound(): Promise<GameRound> {
    const cryptoPairs = Array.from(this.priceCache.keys());
    const randomPair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
    const currentPrice = await this.updatePrice(randomPair);

    const round: GameRound = {
      id: `round_${Date.now()}`,
      roundNumber: this.activeRounds.size + 1,
      cryptoPair: randomPair,
      startTime: new Date(),
      endTime: new Date(Date.now() + getGameShowConfig().predictionWindow),
      startPrice: currentPrice,
      totalBets: 0,
      totalPlayers: 0,
      predictions: [],
      status: 'active',
    };

    this.activeRounds.set(round.id, round);

    console.log(`🚀 New game round started: ${randomPair} at $${currentPrice.toFixed(2)}`);

    // Schedule round completion
    setTimeout(() => {
      this.completeGameRound(round.id).catch(console.error);
    }, getGameShowConfig().predictionWindow);

    return round;
  }

  /**
   * Complete a game round
   */
  async completeGameRound(roundId: string): Promise<void> {
    const round = this.activeRounds.get(roundId);
    if (!round || round.status !== 'active') {
      return;
    }

    const endPrice = await this.updatePrice(round.cryptoPair);
    round.endPrice = endPrice;
    round.status = 'completed';

    const priceChange = ((endPrice - round.startPrice) / round.startPrice) * 100;
    
    console.log(`🏁 Round ${round.roundNumber} completed: ${round.cryptoPair} moved ${priceChange.toFixed(2)}% (${round.startPrice.toFixed(2)} → ${endPrice.toFixed(2)})`);

    // Resolve all predictions for this round
    for (const prediction of round.predictions) {
      await this.resolvePrediction(prediction.id);
    }
  }

  /**
   * Get active game rounds
   */
  getActiveRounds(): GameRound[] {
    return Array.from(this.activeRounds.values()).filter(r => r.status === 'active');
  }

  /**
   * Get price prediction by ID (mock implementation)
   */
  private async getPredictionById(predictionId: string): Promise<GamePrediction | null> {
    // In a real implementation, this would query the database
    // For demo purposes, we'll return a mock prediction
    return null;
  }

  /**
   * Predict price movement using simple technical analysis
   */
  predictPriceMovement(symbol: string, timeframe: number = 300): PriceMovement {
    const pair = this.getCurrentPrice(symbol);
    if (!pair) {
      return { direction: 'up', percentage: 0, confidence: 0 };
    }

    // Simple random prediction for demo (in production, use real TA)
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = Math.random() * 5; // 0-5% movement
    const confidence = Math.random() * 100; // 0-100% confidence

    return { direction, percentage, confidence };
  }

  /**
   * Get leaderboard for price prediction games
   */
  async getPriceGameLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    totalWins: number;
    totalBets: number;
    accuracy: number;
    totalEarnings: number;
  }>> {
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock data
    return [
      { userId: 'user1', totalWins: 45, totalBets: 67, accuracy: 67.2, totalEarnings: 1250.50 },
      { userId: 'user2', totalWins: 38, totalBets: 52, accuracy: 73.1, totalEarnings: 980.25 },
      { userId: 'user3', totalWins: 29, totalBets: 41, accuracy: 70.7, totalEarnings: 765.80 },
    ];
  }

  /**
   * Get game statistics
   */
  getGameStats(): {
    totalRounds: number;
    activePredictions: number;
    totalVolume: number;
    averageAccuracy: number;
  } {
    return {
      totalRounds: this.activeRounds.size,
      activePredictions: Array.from(this.activeRounds.values())
        .reduce((acc, round) => acc + round.predictions.length, 0),
      totalVolume: 50000, // Mock data
      averageAccuracy: 65.8, // Mock data
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Export singleton instance
export const priceGameService = new PriceGameService(); 