'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';

interface CryptoPair {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  icon: string;
}

interface GameRound {
  id: string;
  cryptoPair: string;
  startPrice: number;
  timeRemaining: number;
  totalPlayers: number;
  totalVolume: number;
}

export const PricePredictionGame: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [selectedPair, setSelectedPair] = useState<string>('BTC-USD');
  const [predictionPrice, setPredictionPrice] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [activeRound, setActiveRound] = useState<GameRound | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock crypto pairs data
  const cryptoPairs: CryptoPair[] = [
    { symbol: 'BTC-USD', name: 'Bitcoin', currentPrice: 43250.00, change24h: 2.5, icon: '₿' },
    { symbol: 'ETH-USD', name: 'Ethereum', currentPrice: 2580.00, change24h: -1.2, icon: 'Ξ' },
    { symbol: 'LINK-USD', name: 'Chainlink', currentPrice: 14.50, change24h: 4.8, icon: '🔗' },
    { symbol: 'MATIC-USD', name: 'Polygon', currentPrice: 0.85, change24h: 1.9, icon: '⬟' },
    { symbol: 'UNI-USD', name: 'Uniswap', currentPrice: 6.25, change24h: -0.5, icon: '🦄' },
  ];

  const currentPair = cryptoPairs.find(pair => pair.symbol === selectedPair);

  useEffect(() => {
    // Mock active round data
    setActiveRound({
      id: 'round_123',
      cryptoPair: selectedPair,
      startPrice: currentPair?.currentPrice || 0,
      timeRemaining: 297, // 4:57 remaining
      totalPlayers: 42,
      totalVolume: 1250.75,
    });
  }, [selectedPair, currentPair]);

  const handlePrediction = async () => {
    if (!isConnected || !predictionPrice || !betAmount) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Prediction submitted:', {
      pair: selectedPair,
      currentPrice: currentPair?.currentPrice,
      predictedPrice: parseFloat(predictionPrice),
      betAmount: parseFloat(betAmount),
      userAddress: address,
    });

    setIsLoading(false);
    setPredictionPrice('');
    setBetAmount('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isConnected) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-2xl font-bold text-white mb-4">Price Prediction Game</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to start making price predictions and earning real ETH rewards!
        </p>
        <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-400/30">
          <span>⚠️</span>
          <span className="font-semibold">Wallet connection required</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Round Status */}
      {activeRound && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-400/30 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🎮 Live Round #{activeRound.id.split('_')[1]}</h3>
            <div className="text-2xl font-bold text-green-400">
              ⏰ {formatTime(activeRound.timeRemaining)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Players</div>
              <div className="text-xl font-bold text-white">{activeRound.totalPlayers}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Total Volume</div>
              <div className="text-xl font-bold text-white">${activeRound.totalVolume.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Payout Multiplier</div>
              <div className="text-xl font-bold text-green-400">1.8x</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Crypto Pair Selection */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Select Crypto Pair</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {cryptoPairs.map((pair) => (
            <motion.button
              key={pair.symbol}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPair(pair.symbol)}
              className={`p-4 rounded-lg border transition-all ${
                selectedPair === pair.symbol
                  ? 'bg-purple-500/20 border-purple-400/50 text-white'
                  : 'bg-white/5 border-white/20 text-gray-400 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-2">{pair.icon}</div>
              <div className="font-semibold">{pair.name}</div>
              <div className="text-sm">${pair.currentPrice.toFixed(2)}</div>
              <div className={`text-xs ${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
              </div>
            </motion.button>
          ))}
        </div>

        {currentPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-2xl font-bold text-white">
                  ${currentPair.currentPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">24h Change</div>
                <div className={`text-lg font-semibold ${
                  currentPair.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {currentPair.change24h >= 0 ? '+' : ''}{currentPair.change24h}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Prediction Form */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎯 Make Your Prediction</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Predicted Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={predictionPrice}
              onChange={(e) => setPredictionPrice(e.target.value)}
              placeholder={currentPair ? currentPair.currentPrice.toFixed(2) : '0.00'}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Bet Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="10.00"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="1.00"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50"
            />
            <div className="text-xs text-gray-500 mt-1">Min: $0.01, Max: $10.00</div>
          </div>
        </div>

        {predictionPrice && betAmount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-400/30"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-400">Your Bet</div>
                <div className="text-lg font-bold text-white">${parseFloat(betAmount).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Potential Win</div>
                <div className="text-lg font-bold text-green-400">
                  ${(parseFloat(betAmount) * 1.8).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Prediction</div>
                <div className="text-lg font-bold text-white">
                  ${parseFloat(predictionPrice).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrediction}
          disabled={!predictionPrice || !betAmount || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting Prediction...</span>
            </div>
          ) : (
            '🚀 Submit Prediction'
          )}
        </motion.button>

        <div className="mt-4 text-center text-sm text-gray-400">
          Predictions close when the timer reaches 0:00. Good luck! 🍀
        </div>
      </div>

      {/* Game Rules */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">📋 Game Rules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">How to Play</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Select a crypto pair</li>
              <li>• Predict the price in 5 minutes</li>
              <li>• Place your bet ($0.01 - $10.00)</li>
              <li>• Win 1.8x your bet if correct</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Winning Criteria</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Prediction within 2% tolerance</li>
              <li>• Real-time Chainlink price feeds</li>
              <li>• Instant payouts via CDP wallet</li>
              <li>• Weekly leaderboard rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 