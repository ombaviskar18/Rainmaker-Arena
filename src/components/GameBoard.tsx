'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhaleCard } from './WhaleCard';
import { GameInput } from './GameInput';
import { WelcomeScreen } from './WelcomeScreen';
import { ConfettiEffect } from './ConfettiEffect';
import { XMTPChat } from './XMTPChat';
import { useGameState } from '@/hooks/useGameState';
import { GuessResult } from '@/types';
import { cn } from '@/lib/utils';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export function GameBoard() {
  const {
    gameState,
    startGame,
    makeGuess,
    getNextHint,
    resetGame,
    currentHint,
    hasMoreHints
  } = useGameState();

  const [lastGuessResult, setLastGuessResult] = useState<GuessResult | null>(null);
  const [showWhale, setShowWhale] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleGuess = (guess: string) => {
    const result = makeGuess(guess);
    setLastGuessResult(result);
    
    if (result.isCorrect) {
      setShowWhale(true);
      setShowConfetti(true);
      // Hide whale after 2 seconds and continue
      setTimeout(() => {
        setShowWhale(false);
        setLastGuessResult(null);
      }, 2000);
    } else {
      // Hide incorrect result after 1.5 seconds
      setTimeout(() => {
        setLastGuessResult(null);
      }, 1500);
    }
  };

  const handleHintRequest = () => {
    getNextHint();
  };

  const handleReset = () => {
    setLastGuessResult(null);
    setShowWhale(false);
    setShowConfetti(false);
    resetGame();
  };

  if (gameState.gameStatus === 'waiting') {
    return <WelcomeScreen onStartGame={startGame} />;
  }

  if (gameState.gameStatus === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white mb-4">Game Complete!</h2>
            <p className="text-xl text-white/80 mb-6">
              Final Score: <span className="font-bold text-yellow-400">{gameState.score.toLocaleString()}</span>
            </p>
            
            <div className="space-y-4">
              <motion.button
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Play Again
              </motion.button>
              
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold"
              >
                <Home className="w-5 h-5 inline mr-2" />
                Back to Home
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Guess the Whale
          </h1>
          <p className="text-white/60">Round {gameState.round} of {gameState.maxRounds}</p>
        </motion.div>

        {/* Game content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Game */}
          <div className="space-y-6">
            {/* Whale card */}
            <WhaleCard
              whale={gameState.currentWhale}
              currentHint={currentHint}
              timeRemaining={gameState.timeRemaining}
              score={gameState.score}
              streak={gameState.streak}
              round={gameState.round}
              maxRounds={gameState.maxRounds}
              isRevealed={showWhale}
            />

            {/* Guess result */}
            <AnimatePresence>
              {lastGuessResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className={cn(
                    "p-6 rounded-2xl border text-center",
                    lastGuessResult.isCorrect
                      ? "bg-green-500/20 border-green-400/50 text-green-300"
                      : "bg-red-500/20 border-red-400/50 text-red-300"
                  )}
                >
                  <div className="text-2xl font-bold mb-2">{lastGuessResult.message}</div>
                  {lastGuessResult.isCorrect && (
                    <div className="space-y-1 text-sm">
                      <div>Points: +{lastGuessResult.points}</div>
                      {lastGuessResult.timeBonus > 0 && (
                        <div>Time Bonus: +{lastGuessResult.timeBonus}</div>
                      )}
                      {lastGuessResult.streakBonus > 0 && (
                        <div>Streak Bonus: +{lastGuessResult.streakBonus}</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game input */}
            {gameState.gameStatus === 'playing' && !showWhale && (
              <GameInput
                onGuess={handleGuess}
                onHintRequest={handleHintRequest}
                onReset={handleReset}
                disabled={gameState.gameStatus !== 'playing'}
                hasMoreHints={hasMoreHints}
              />
            )}
          </div>

          {/* Right Column - XMTP Chat */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <XMTPChat />
            </motion.div>
            
            {/* Whale Alert Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-400/20 p-6"
            >
              <h3 className="text-yellow-300 font-bold mb-3 flex items-center">
                🚨 Live Whale Alerts
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Get real-time notifications when famous crypto whales make moves! 
                Our AI monitors onchain activity and sends alerts directly to your chat.
              </p>
              <div className="mt-4 text-xs text-white/60">
                🔍 Monitoring Ethereum • Base • NFTs • DeFi
              </div>
            </motion.div>
          </div>
        </div>

        {/* Game status */}
        {gameState.gameStatus === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Game Paused</h3>
              <p className="text-white/70">Click anywhere to continue</p>
            </div>
          </motion.div>
        )}

        {/* Confetti effect */}
        <ConfettiEffect 
          show={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
      </div>
    </div>
  );
} 