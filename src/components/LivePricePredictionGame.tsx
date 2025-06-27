'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins, 
  Trophy,
  Target,
  Zap,
  DollarSign,
  Timer,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { useAccount } from 'wagmi';
import realTimePriceService, { PriceData, PredictionRound, GameResult } from '../lib/realTimePriceService';
// CDP wallet operations moved to API routes

interface LivePricePredictionGameProps {
  onPointsEarned?: (points: number) => void;
}

export const LivePricePredictionGame: React.FC<LivePricePredictionGameProps> = ({ onPointsEarned }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [activeRounds, setActiveRounds] = useState<PredictionRound[]>([]);
  const [userPredictions, setUserPredictions] = useState<Map<string, 'up' | 'down'>>(new Map());
  const [userBetAmounts, setUserBetAmounts] = useState<Map<string, number>>(new Map());
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedBetAmount, setSelectedBetAmount] = useState(0.01);
  const [showBetModal, setShowBetModal] = useState<{ roundId: string; direction: 'up' | 'down' } | null>(null);
  
  const { address, isConnected } = useAccount();

  // Betting amount options
  const betAmounts = [0.001, 0.01, 0.05, 0.1, 0.5, 1.0];

  // Update current time every second for smooth countdown
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    // Subscribe to price updates
    const handlePriceUpdate = (newPrices: PriceData[]) => {
      setPrices(newPrices);
      setIsLoading(false);
    };

    const handleNewRound = (round: PredictionRound) => {
      setActiveRounds(prev => {
        // Remove old round for same crypto and add new one
        const filtered = prev.filter(r => r.crypto !== round.crypto);
        return [...filtered, round].sort((a, b) => a.crypto.localeCompare(b.crypto));
      });
    };

    const handleRoundEnded = (result: GameResult) => {
      setGameResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      setActiveRounds(prev => prev.filter(r => r.id !== result.roundId));
      
      // Check if user won and award points
      const userWon = result.winners.some(w => w.walletAddress === address);
      if (userWon && onPointsEarned) {
        const points = Math.floor(result.payout * 1000); // Convert ETH to points
        onPointsEarned(points);
      }

      // Distribute ETH rewards to winners via CDP wallet
      if (result.winners.length > 0) {
        const ethWinners = result.winners
          .filter(winner => winner.walletAddress && winner.walletAddress.startsWith('0x'))
          .map(winner => ({
            walletAddress: winner.walletAddress!,
            amount: 0.001 // 0.001 ETH per win
          }));

        if (ethWinners.length > 0) {
          fetch('/api/cdp-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'distributeGameWinnings',
              roundId: result.roundId,
              winners: ethWinners
            })
          })
          .then(res => res.json())
          .catch(error => {
            console.error('Error distributing ETH rewards:', error);
          });
        }
      }
    };

    // Subscribe to events
    realTimePriceService.on('priceUpdate', handlePriceUpdate);
    realTimePriceService.on('newRound', handleNewRound);
    realTimePriceService.on('roundEnded', handleRoundEnded);

    // Get initial data
    setPrices(realTimePriceService.getPrices());
    setActiveRounds(realTimePriceService.getActiveRounds());

    return () => {
      realTimePriceService.off('priceUpdate', handlePriceUpdate);
      realTimePriceService.off('newRound', handleNewRound);
      realTimePriceService.off('roundEnded', handleRoundEnded);
    };
  }, [address, onPointsEarned]);

  const openBetModal = (roundId: string, direction: 'up' | 'down') => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to place predictions');
      return;
    }
    setShowBetModal({ roundId, direction });
  };

  const placePrediction = (roundId: string, direction: 'up' | 'down', betAmount: number) => {
    const round = activeRounds.find(r => r.id === roundId);
    if (!round) return;

    const success = realTimePriceService.placePrediction({
      userId: address,
      walletAddress: address,
      prediction: direction,
      betAmount: betAmount,
      roundId: roundId
    });

    if (success) {
      setUserPredictions(prev => new Map(prev.set(roundId, direction)));
      setUserBetAmounts(prev => new Map(prev.set(roundId, betAmount)));
      setShowBetModal(null);
    }
  };

  const confirmBet = () => {
    if (showBetModal) {
      placePrediction(showBetModal.roundId, showBetModal.direction, selectedBetAmount);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatTimeLeft = (endTime: number) => {
    const timeLeft = Math.max(0, endTime - currentTime);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeLeftPercentage = (startTime: number, endTime: number) => {
    const total = endTime - startTime;
    const remaining = endTime - currentTime;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  const getCryptoIcon = (symbol: string) => {
    const icons: Record<string, string> = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'LINK': '🔗',
      'MATIC': '🟣',
      'UNI': '🦄',
      'AVAX': '❄️',
      'SOL': '☀️',
      'ADA': '💎',
      'DOT': '⚪'
    };
    return icons[symbol] || '🪙';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading real-time multi-chain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <Zap className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Multi-Chain Prediction Arena
          </h1>
          <Zap className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <p className="text-gray-400 text-lg">
          Predict price movements across multiple blockchains and earn real ETH rewards
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{activeRounds.length}</div>
            <div className="text-gray-400">Active Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{gameResults.length}</div>
            <div className="text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{userPredictions.size}</div>
            <div className="text-gray-400">Your Bets</div>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="backdrop-blur-xl bg-orange-500/20 rounded-xl border border-orange-400/30 p-6 text-center">
          <div className="text-orange-400 font-semibold mb-2">⚠️ Wallet Connection Required</div>
          <p className="text-gray-300">Connect your wallet to place predictions and earn ETH rewards!</p>
        </div>
      )}

      {/* Active Prediction Rounds Grid */}
      {activeRounds.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
          <div className="animate-pulse mb-4">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">🎮 Game Rounds Starting Soon!</h3>
          <p className="text-gray-400 mb-4">
            We're setting up prediction rounds for all 9 cryptocurrencies. 
            New rounds start every few seconds!
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 max-w-md mx-auto">
            <div>🟢 Bitcoin</div>
            <div>🟢 Ethereum</div>
            <div>🟢 Chainlink</div>
            <div>🟢 Polygon</div>
            <div>🟢 Uniswap</div>
            <div>🟢 Avalanche</div>
            <div>🟢 Solana</div>
            <div>🟢 Cardano</div>
            <div>🟢 Polkadot</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRounds.map((round) => {
          const priceData = prices.find(p => p.id === round.crypto);
          const userPrediction = userPredictions.get(round.id);
          const userBetAmount = userBetAmounts.get(round.id) || 0.01;
          const timeLeftPercentage = getTimeLeftPercentage(round.startTime, round.endTime);
          const timeLeft = formatTimeLeft(round.endTime);
          const isExpiring = timeLeftPercentage < 20;

          if (!priceData) return null;

          return (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`backdrop-blur-xl rounded-xl border p-6 transition-all duration-300 ${
                userPrediction 
                  ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCryptoIcon(priceData.symbol)}</div>
                  <div>
                    <div className="font-bold text-white text-lg">{priceData.symbol}</div>
                    <div className="text-sm text-gray-400">{priceData.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400">
                    {formatPrice(priceData.current_price)}
                  </div>
                  <div className={`flex items-center justify-end space-x-1 text-sm ${
                    (priceData.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(priceData.price_change_percentage_24h || 0) >= 0 ? 
                      <TrendingUp className="w-4 h-4" /> : 
                      <TrendingDown className="w-4 h-4" />
                    }
                    <span>{Math.abs(priceData.price_change_percentage_24h || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Timer Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Timer className={`w-4 h-4 ${isExpiring ? 'text-red-400' : 'text-blue-400'}`} />
                    <span className={`font-mono text-sm ${isExpiring ? 'text-red-400' : 'text-white'}`}>
                      {timeLeft}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Round ends in
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isExpiring ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${timeLeftPercentage}%` }}
                  />
                </div>
              </div>

              {/* User Prediction Status */}
              {userPrediction && (
                <div className="mb-4 p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
                  <div className="flex items-center justify-center space-x-2">
                    {userPrediction === 'up' ? (
                      <ArrowUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-semibold">
                      Predicted: {userPrediction === 'up' ? 'Price Up ↗' : 'Price Down ↘'}
                    </span>
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-1">
                    Bet: {userBetAmount} ETH • Potential Reward: {(userBetAmount * 1.8).toFixed(4)} ETH
                  </div>
                </div>
              )}

              {/* Prediction Buttons */}
              {!userPrediction && isConnected && timeLeftPercentage > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openBetModal(round.id, 'up')}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <ArrowUp className="w-5 h-5" />
                    <span>Price Up</span>
                  </button>
                  <button
                    onClick={() => openBetModal(round.id, 'down')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <ArrowDown className="w-5 h-5" />
                    <span>Price Down</span>
                  </button>
                </div>
              ) : timeLeftPercentage === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <Activity className="w-6 h-6 mx-auto mb-2" />
                  <div>Round Ended - Calculating Results...</div>
                </div>
              ) : !isConnected ? (
                <div className="text-center py-4 text-orange-400">
                  <div className="text-sm">Connect wallet to predict</div>
                </div>
              ) : (
                <div className="text-center py-4 text-purple-400">
                  <div className="text-sm">Prediction placed! Good luck! 🍀</div>
                </div>
              )}

              {/* Round Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400">Start Price</div>
                    <div className="text-white font-semibold">{formatPrice(round.startPrice)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Total Pool</div>
                    <div className="text-white font-semibold">
                      {(round.predictions?.reduce((sum, p) => sum + p.betAmount, 0) || 0).toFixed(3)} ETH
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}

      {/* Recent Results */}
      {gameResults.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>Recent Results</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameResults.slice(0, 6).map((result, index) => {
              const priceData = prices.find(p => p.id === result.crypto);
              const userWon = result.winners.some(w => w.walletAddress === address);
              
              return (
                <motion.div
                  key={result.roundId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    userWon 
                      ? 'bg-green-500/20 border-green-400/50' 
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">{getCryptoIcon(priceData?.symbol || '')}</div>
                      <div className="font-semibold text-white">{priceData?.symbol}</div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      result.winner === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.winner === 'up' ? '↗ UP' : '↘ DOWN'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Start: {formatPrice(result.startPrice)}</div>
                    <div>End: {formatPrice(result.endPrice)}</div>
                    <div>Winners: {result.winners.length}</div>
                    {userWon && <div className="text-green-400 font-semibold">🎉 You Won!</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* How to Play */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="text-purple-400 font-semibold">1. Choose Direction</div>
            <div className="text-gray-400">Predict if the crypto price will go up or down in the next 5 minutes</div>
          </div>
          <div className="space-y-2">
            <div className="text-blue-400 font-semibold">2. Place Bet</div>
            <div className="text-gray-400">Each prediction costs 0.01 ETH. Multiple simultaneous bets allowed!</div>
          </div>
          <div className="space-y-2">
            <div className="text-green-400 font-semibold">3. Win Rewards</div>
            <div className="text-gray-400">Correct predictions earn you ETH rewards automatically via CDP wallet</div>
          </div>
        </div>
      </div>

      {/* Bet Amount Modal */}
      <AnimatePresence>
        {showBetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Select Bet Amount
              </h3>
              
              <div className="text-center mb-4">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  showBetModal.direction === 'up' 
                    ? 'bg-green-500/20 border border-green-400/50' 
                    : 'bg-red-500/20 border border-red-400/50'
                }`}>
                  {showBetModal.direction === 'up' ? (
                    <ArrowUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-semibold">
                    Predicting Price {showBetModal.direction === 'up' ? 'Up' : 'Down'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Choose your bet amount (ETH):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {betAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedBetAmount(amount)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedBetAmount === amount
                            ? 'bg-purple-500/30 border-purple-400 text-white'
                            : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-semibold">{amount} ETH</div>
                        <div className="text-xs text-gray-400">
                          ~${(amount * 2800).toFixed(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Bet Amount:</span>
                    <span className="text-white font-semibold">{selectedBetAmount} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Potential Reward:</span>
                    <span className="text-green-400 font-semibold">
                      {(selectedBetAmount * 1.8).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Loss:</span>
                    <span className="text-red-400 font-semibold">{selectedBetAmount} ETH</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBetModal(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBet}
                    className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                      showBetModal.direction === 'up'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    } text-white`}
                  >
                    Place Bet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 