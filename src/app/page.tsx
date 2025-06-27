'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MCQGame } from '../components/MCQGame';
import { PricePredictionGame } from '../components/PricePredictionGame';
import { LivePricePredictionGame } from '../components/LivePricePredictionGame';
import { NFTMarketplace } from '../components/NFTMarketplace';
import { Leaderboard } from '../components/Leaderboard';
import { Rewards } from '../components/Rewards';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import for Account component to avoid SSR issues
const Account = dynamic(
  () => import('../components/Account').then((mod) => ({ default: mod.Account })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }
);

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'leaderboard' | 'nft' | 'rewards' | 'pricing' | 'account'>('home');
  const [userPoints, setUserPoints] = useState(15000);
  const [userXP, setUserXP] = useState(23500);
  const [userLevel, setUserLevel] = useState(7);
  const [mounted, setMounted] = useState(false);
  
  const { isConnected } = useAccount();

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const handlePointsEarned = (points: number) => {
    setUserPoints(prev => prev + points);
    setUserXP(prev => prev + points * 1.2);
    
    // Level up logic
    const newLevel = Math.floor((userXP + points * 1.2) / 5000) + 1;
    if (newLevel > userLevel) {
      setUserLevel(newLevel);
    }
  };

  // Telegram bot redirect function
  const openTelegramBot = () => {
    window.open('https://t.me/Rain_maker_Arena_bot', '_blank');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="container mx-auto p-6">
            {!isConnected ? (
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Animated Whale */}
                  <motion.div
                    className="text-6xl mb-6 relative z-10 flex justify-center"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="filter drop-shadow-lg">🐋</div>
                    
                    {/* Floating Bubbles Animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                          style={{
                            left: `${30 + i * 20}%`,
                            top: `${20 + (i % 2) * 60}%`,
                          }}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    Rainmaker Arena
                  </h1>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                    Interactive crypto game show with price predictions, community rewards, and unified Telegram experience!
                  </p>
                  
                  {/* Telegram Bot CTA - Prominent placement */}
                  <div className="mb-12">
                    <motion.button
                      onClick={openTelegramBot}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-2 rounded-2xl text-white font-bold text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Animated Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      
                      {/* Telegram Icon Animation */}
                      <motion.span 
                        className="inline-block mr-3 text-xl"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        📱
                      </motion.span>
                      Play on Telegram
                      {/* Pulse Effect */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 opacity-50 animate-ping"></div>
                    </motion.button>
                   
                  </div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-400/30">
                      <span>⚠️</span>
                      <span className="font-semibold">Or connect your wallet to play on Web!</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
                      <div className="text-3xl mb-4">💰</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Price Predictions</h3>
                      <p className="text-gray-400">Predict crypto prices with Chainlink feeds and earn real ETH rewards</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
                      <div className="text-3xl mb-4">🤝</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Unified Experience</h3>
                      <p className="text-gray-400">Play on Web or Telegram with shared profiles and rewards</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
                      <div className="text-3xl mb-4">🏦</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Community Pool</h3>
                      <p className="text-gray-400">Automated weekly distributions to top players via Coinbase CDP</p>
                    </div>
                  </div>
                  
                  {/* Secondary Options */}
                  <div className="mt-12 space-y-4">
                     <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto">
                      🔴 <strong>LIVE NOW!</strong> Real-time crypto predictions • ETH rewards
                    </p>
                    {/* Telegram Bot Features */}
                    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/30">
                      <h3 className="text-lg font-semibold text-white mb-3">🤖 Telegram Bot Features:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                        <div>✅ Live crypto prices (30s updates)</div>
                        <div>✅ Real ETH betting & rewards</div>
                        <div>✅ 5-minute prediction rounds</div>
                        <div>✅ Global leaderboards</div>
                        <div>✅ Automatic notifications</div>
                        <div>✅ Statistics tracking</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-8">
                <LivePricePredictionGame onPointsEarned={handlePointsEarned} />
                
                {/* Gaming Options for Connected Users */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Telegram Bot Option */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/30 p-8 text-center">
                    <motion.div
                      className="text-5xl mb-4 relative z-10 flex justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="filter drop-shadow-lg">📱💰</div>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-4">Play on Telegram</h2>
                    <p className="text-gray-400 mb-6">
                      Access live crypto predictions with real ETH rewards directly on Telegram!
                    </p>
                    
                    <motion.button 
                      onClick={openTelegramBot}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full group relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <span className="relative z-10">🚀 Launch Telegram Bot</span>
                    </motion.button>
                    <p className="text-xs text-gray-400 mt-3">🔴 Live • Auto-updating prices • Real ETH rewards</p>
                  </div>

                  {/* XMTP Integration */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 p-8 text-center">
                    <motion.div
                      className="text-5xl mb-4 relative z-10 flex justify-center"
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="filter drop-shadow-lg">🌧️⚡</div>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-4">Advanced Whale Hunting</h2>
                    <p className="text-gray-400 mb-6">
                      Experience XMTP messaging, AI trivia, and real-time whale detection!
                    </p>
                    
                    <button 
                      onClick={() => window.open('/xmtp', '_blank')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
                    >
                      🚀 Launch XMTP Arena
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Opens in new tab • Includes DetectWhale & XMTP chat</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'leaderboard':
        return <Leaderboard />;
      case 'nft':
        return <NFTMarketplace />;
      case 'rewards':
        return <Rewards userPoints={userPoints} userLevel={userLevel} />;
      case 'account':
        return <Account />;
      case 'pricing':
        return <Pricing />;
      default:
        return <MCQGame onPointsEarned={handlePointsEarned} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">

      
      <Navbar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default function Home() {
  return <MainApp />;
}
