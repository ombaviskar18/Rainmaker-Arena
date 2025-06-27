'use client';

import { motion } from 'framer-motion';
import { Play, Trophy, Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  onStartGame: () => void;
  className?: string;
}

export function WelcomeScreen({ onStartGame, className }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            animate={{
              y: [-100, window.innerHeight + 100],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '-100px'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Guess the Whale
          </h1>
          <motion.div
            className="w-32 h-32 mx-auto mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
              style={{
                clipPath: "polygon(0% 40%, 20% 20%, 80% 20%, 100% 40%, 90% 80%, 10% 80%)"
              }}
            />
          </motion.div>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
            Test your crypto knowledge! Can you identify famous wallets from onchain clues?
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: Target,
              title: "Multiple Hints",
              description: "Get progressively easier clues to help you guess"
            },
            {
              icon: Clock,
              title: "Time Challenge",
              description: "Race against the clock for bonus points"
            },
            {
              icon: Zap,
              title: "Streak Bonus",
              description: "Build streaks for massive score multipliers"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Game rules */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Objective</h4>
              <ul className="space-y-2 text-white/80">
                <li>• Identify famous crypto wallets from hints</li>
                <li>• Score points based on speed and accuracy</li>
                <li>• Build streaks for bonus multipliers</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">⚡ Scoring</h4>
              <ul className="space-y-2 text-white/80">
                <li>• Base: 100 points per correct guess</li>
                <li>• Time bonus: +10 points per 5 seconds</li>
                <li>• Streak bonus: +25 points per streak</li>
                <li>• Hint penalty: -15 points per hint</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={onStartGame}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white font-bold text-xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center space-x-3">
            <Play className="w-6 h-6" />
            <span>Start Hunting Whales</span>
          </div>
          
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ borderRadius: '50%' }}
          />
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12"
        >
          <p className="text-white/50 text-sm">
            Built with ❤️ using Next.js, XMTP, and Web3 magic
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
} 