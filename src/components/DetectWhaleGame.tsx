'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Timer,
  Globe,
  Coins
} from 'lucide-react';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  isWhale: boolean;
  address?: string;
  timestamp: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface Chain {
  id: string;
  name: string;
  symbol: string;
  coinGeckoId: string;
  icon: string;
  whaleThreshold: number;
  pairSymbol: string;
}

interface GameStats {
  score: number;
  correctGuesses: number;
  totalGuesses: number;
  accuracy: number;
  timeLeft: number;
  level: number;
}

interface DetectWhaleGameProps {
  onScoreUpdate?: (score: number) => void;
}

const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    coinGeckoId: 'ethereum',
    icon: '⟠',
    whaleThreshold: 10,
    pairSymbol: 'USDT'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    coinGeckoId: 'bitcoin',
    icon: '₿',
    whaleThreshold: 1,
    pairSymbol: 'USDT'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    coinGeckoId: 'solana',
    icon: '◎',
    whaleThreshold: 100,
    pairSymbol: 'USDT'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    coinGeckoId: 'cardano',
    icon: '₳',
    whaleThreshold: 10000,
    pairSymbol: 'USDT'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    coinGeckoId: 'matic-network',
    icon: '🔺',
    whaleThreshold: 5000,
    pairSymbol: 'USDT'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    coinGeckoId: 'avalanche-2',
    icon: '🔺',
    whaleThreshold: 200,
    pairSymbol: 'USDT'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    coinGeckoId: 'chainlink',
    icon: '🔗',
    whaleThreshold: 1000,
    pairSymbol: 'USDT'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    coinGeckoId: 'polkadot',
    icon: '●',
    whaleThreshold: 500,
    pairSymbol: 'USDT'
  }
];

export const DetectWhaleGame: React.FC<DetectWhaleGameProps> = ({ onScoreUpdate }) => {
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [showChainSelection, setShowChainSelection] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(2100);
  const [priceChange, setPriceChange] = useState(0);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [gameActive, setGameActive] = useState(false);
  const [gameMode, setGameMode] = useState<'training' | 'challenge'>('training');
  const [selectedEntry, setSelectedEntry] = useState<OrderBookEntry | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string; points?: number }>({ type: null, message: '' });
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctGuesses: 0,
    totalGuesses: 0,
    accuracy: 0,
    timeLeft: gameMode === 'challenge' ? 120 : 60,
    level: 1
  });

  // Whale addresses for realistic simulation
  const whaleAddresses = [
    { name: 'Vitalik Buterin', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
    { name: 'Binance Hot Wallet', address: '0x28C6c06298d514Db089934071355E5743bf21d60' },
    { name: 'Coinbase Custody', address: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3' },
    { name: 'Punk6529', address: '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b' },
    { name: 'Pranksy', address: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459' },
    { name: 'Unknown Whale', address: '0x742d35Cc6634C0532925a3b8D6Ac6d71...f1eB' },
    { name: 'DeFi Whale', address: '0x99C9fc46f92E8a1c0deC1b1747d010903E8...2Ba2' }
  ];

  // Fetch real price from CoinGecko
  const fetchRealPrice = async (chain: Chain) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${chain.coinGeckoId}&vs_currencies=usd&include_24hr_change=true`, {
        headers: {
          'X-CG-Demo-API-Key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY || 'demo'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const price = data[chain.coinGeckoId]?.usd || currentPrice;
        const change = data[chain.coinGeckoId]?.usd_24h_change || 0;
        
        setCurrentPrice(price);
        setPriceChange(change);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      // Fallback to simulated prices if API fails
      setCurrentPrice(selectedChain.symbol === 'BTC' ? 65000 : selectedChain.symbol === 'SOL' ? 95 : selectedChain.symbol === 'ADA' ? 0.45 : 2100);
    }
  };

  const generateOrderBook = () => {
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];
    
    const basePrice = currentPrice;
    const spread = basePrice * 0.001; // 0.1% spread
    
    // Generate realistic order sizes based on chain
    const generateAmount = () => {
      const random = Math.random();
      if (random < 0.1) {
        // 10% chance of whale order
        return (Math.random() * selectedChain.whaleThreshold * 3) + selectedChain.whaleThreshold;
      } else if (random < 0.3) {
        // 20% chance of medium order
        return Math.random() * selectedChain.whaleThreshold * 0.8 + selectedChain.whaleThreshold * 0.2;
      } else {
        // 70% chance of small order
        return Math.random() * selectedChain.whaleThreshold * 0.3;
      }
    };

    // Generate bids (buy orders)
    for (let i = 0; i < 12; i++) {
      const price = basePrice - (spread * (i + 1)) - (Math.random() * basePrice * 0.0001);
      const amount = generateAmount();
      const isWhale = amount >= selectedChain.whaleThreshold;
      
      bids.push({
        price,
        amount,
        total: price * amount,
        isWhale,
        timestamp: Date.now() + i
      });
    }

    // Generate asks (sell orders)
    for (let i = 0; i < 12; i++) {
      const price = basePrice + (spread * (i + 1)) + (Math.random() * basePrice * 0.0001);
      const amount = generateAmount();
      const isWhale = amount >= selectedChain.whaleThreshold;
      
      asks.push({
        price,
        amount,
        total: price * amount,
        isWhale,
        timestamp: Date.now() + i + 100
      });
    }

    setOrderBook({ bids, asks });
  };

  // Update price periodically
  useEffect(() => {
    const priceInterval = setInterval(() => {
      if (gameActive) {
        const change = (Math.random() - 0.5) * 0.02; // Max 2% change
        setCurrentPrice(prev => {
          const newPrice = prev * (1 + change);
          return Math.max(newPrice, prev * 0.95); // Prevent extreme drops
        });
        
        generateOrderBook();
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(priceInterval);
  }, [gameActive, selectedChain]);

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameActive && gameStats.timeLeft > 0) {
      timer = setInterval(() => {
        setGameStats(prev => {
          if (prev.timeLeft <= 1) {
            endGame();
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameActive, gameStats.timeLeft]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showChainSelection) {
        setShowChainSelection(false);
      }
    };

    if (showChainSelection) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChainSelection]);

  // Initialize with real price on chain change
  useEffect(() => {
    fetchRealPrice(selectedChain);
    generateOrderBook();
  }, [selectedChain]);

  // Initialize order book
  useEffect(() => {
    generateOrderBook();
  }, []);

  const handleChainSelection = (chain: Chain) => {
    setSelectedChain(chain);
    setShowChainSelection(false);
    setGameActive(false);
    setGameStats(prev => ({
      ...prev,
      score: 0,
      correctGuesses: 0,
      totalGuesses: 0,
      accuracy: 0,
      timeLeft: gameMode === 'challenge' ? 120 : 60,
      level: 1
    }));
    setFeedback({ type: null, message: '' });
  };

  const startGame = () => {
    setGameActive(true);
    setGameStats({
      score: 0,
      correctGuesses: 0,
      totalGuesses: 0,
      accuracy: 0,
      timeLeft: gameMode === 'challenge' ? 120 : 60,
      level: 1
    });
    setFeedback({ type: null, message: '' });
    generateOrderBook();
  };

  const endGame = () => {
    setGameActive(false);
    if (onScoreUpdate) {
      onScoreUpdate(gameStats.score);
    }
    
    // Show final score feedback
    setFeedback({
      type: gameStats.accuracy >= 70 ? 'success' : 'error',
      message: `Game Over! Final Score: ${gameStats.score} (${gameStats.accuracy.toFixed(1)}% accuracy)`,
      points: gameStats.score
    });
  };

  const selectEntry = (entry: OrderBookEntry, side: 'bid' | 'ask') => {
    if (!gameActive || selectedEntry) return;

    setSelectedEntry(entry);
    
    const isCorrect = entry.isWhale;
    const points = isCorrect ? (entry.amount >= 30 ? 20 : 10) : 0;
    
    setGameStats(prev => {
      const newCorrect = prev.correctGuesses + (isCorrect ? 1 : 0);
      const newTotal = prev.totalGuesses + 1;
      const newAccuracy = (newCorrect / newTotal) * 100;
      const newScore = prev.score + points;

      return {
        ...prev,
        score: newScore,
        correctGuesses: newCorrect,
        totalGuesses: newTotal,
        accuracy: newAccuracy
      };
    });

    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect 
        ? `🐋 Whale Found! +${points} points` 
        : '🔍 Not a whale. Try again!',
      points
    });

    // Clear selection after 2 seconds
    setTimeout(() => {
      setSelectedEntry(null);
      setFeedback({ type: null, message: '' });
    }, 2000);
  };

  const resetGame = () => {
    setGameActive(false);
    setGameStats({
      score: 0,
      correctGuesses: 0,
      totalGuesses: 0,
      accuracy: 0,
      timeLeft: 60,
      level: 1
    });
    setSelectedEntry(null);
    setFeedback({ type: null, message: '' });
    generateOrderBook();
  };

  const formatPrice = (price: number) => {
    if (selectedChain.symbol === 'BTC') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (selectedChain.symbol === 'ADA' || price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };
  
  const formatAmount = (amount: number) => {
    if (selectedChain.symbol === 'ADA' || amount > 1000) {
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${selectedChain.symbol}`;
    } else {
      return `${amount.toFixed(3)} ${selectedChain.symbol}`;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">DetectWhale</h3>
        </div>
        <div className="flex items-center space-x-2 relative">
          <button
            onClick={() => setShowChainSelection(!showChainSelection)}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded-lg text-xs transition-colors"
          >
            <span className="text-lg">{selectedChain.icon}</span>
            <span className="text-white">{selectedChain.symbol}</span>
            <Globe className="w-3 h-3 text-gray-400" />
          </button>
          <div className="flex items-center space-x-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${gameActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gray-400">{gameActive ? 'LIVE' : 'PAUSED'}</span>
          </div>
          
          {/* Chain Selection Modal */}
          <AnimatePresence>
            {showChainSelection && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 w-64 shadow-2xl"
                style={{ top: '100%', right: '0', marginTop: '8px' }}
              >
                <h4 className="text-white text-sm font-medium mb-2 flex items-center space-x-1">
                  <Coins className="w-4 h-4" />
                  <span>Select Chain</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => handleChainSelection(chain)}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-xs transition-colors ${
                        selectedChain.id === chain.id
                          ? 'bg-blue-500/20 border border-blue-400/30 text-blue-400'
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                      }`}
                    >
                      <span className="text-sm">{chain.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{chain.symbol}</div>
                        <div className="text-xs opacity-60">{chain.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-purple-500/20 rounded-lg p-2 text-center">
          <div className="text-purple-400 text-xs">Score</div>
          <div className="text-white font-bold">{gameStats.score}</div>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-2 text-center">
          <div className="text-blue-400 text-xs">
            {gameActive ? (
              <div className="flex items-center justify-center space-x-1">
                <Timer className="w-3 h-3" />
                <span>Time</span>
              </div>
            ) : 'Accuracy'}
          </div>
          <div className="text-white font-bold">
            {gameActive ? `${gameStats.timeLeft}s` : `${gameStats.accuracy.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Game Mode Selection */}
      {!gameActive && (
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setGameMode('training')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                gameMode === 'training'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Training (60s)
            </button>
            <button
              onClick={() => setGameMode('challenge')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                gameMode === 'challenge'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Challenge (120s)
            </button>
          </div>
        </div>
      )}

      {/* Current Price */}
      <div className="mb-4 p-2 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">{selectedChain.symbol}/{selectedChain.pairSymbol}</span>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold">{formatPrice(currentPrice)}</span>
            <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-2 rounded-lg text-center text-sm font-medium ${
              feedback.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-red-500/20 text-red-400 border border-red-400/30'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Book */}
      <div className="mb-4">
        <h4 className="text-white text-sm font-medium mb-2 flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Order Book</span>
          <span className="text-xs text-gray-400">(Click to detect whales)</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Asks (Sell Orders) */}
          <div>
            <div className="text-red-400 font-medium mb-1 text-center">Asks (Sell)</div>
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
              {orderBook.asks.slice(0, 8).map((ask, index) => (
                <motion.div
                  key={`ask-${ask.timestamp}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex justify-between p-1 rounded cursor-pointer transition-all ${
                    selectedEntry === ask
                      ? ask.isWhale
                        ? 'bg-green-500/30 border border-green-400/50'
                        : 'bg-red-500/30 border border-red-400/50'
                      : ask.isWhale
                        ? 'bg-red-500/10 hover:bg-red-500/20'
                        : 'bg-red-500/5 hover:bg-red-500/10'
                  }`}
                  onClick={() => selectEntry(ask, 'ask')}
                >
                  <span className="text-white">{formatPrice(ask.price)}</span>
                  <span className={`${ask.amount >= selectedChain.whaleThreshold ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                    {formatAmount(ask.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="text-green-400 font-medium mb-1 text-center">Bids (Buy)</div>
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
              {orderBook.bids.slice(0, 8).map((bid, index) => (
                <motion.div
                  key={`bid-${bid.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex justify-between p-1 rounded cursor-pointer transition-all ${
                    selectedEntry === bid
                      ? bid.isWhale
                        ? 'bg-green-500/30 border border-green-400/50'
                        : 'bg-red-500/30 border border-red-400/50'
                      : bid.isWhale
                        ? 'bg-green-500/10 hover:bg-green-500/20'
                        : 'bg-green-500/5 hover:bg-green-500/10'
                  }`}
                  onClick={() => selectEntry(bid, 'bid')}
                >
                  <span className="text-white">{formatPrice(bid.price)}</span>
                  <span className={`${bid.amount >= selectedChain.whaleThreshold ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                    {formatAmount(bid.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex space-x-2">
        {!gameActive ? (
          <button
            onClick={startGame}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={endGame}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>Stop</span>
          </button>
        )}
        <button
          onClick={resetGame}
          className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Instructions */}
      {!gameActive && gameStats.totalGuesses === 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
          <h5 className="text-blue-400 font-medium text-sm mb-2">How to Play:</h5>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Click on orders you think are from whales ({selectedChain.whaleThreshold}+ {selectedChain.symbol})</li>
            <li>• Yellow highlighted amounts are potential whales</li>
            <li>• Earn more points for larger whale orders</li>
            <li>• Aim for 70%+ accuracy to win!</li>
          </ul>
        </div>
      )}
    </div>
  );
}; 