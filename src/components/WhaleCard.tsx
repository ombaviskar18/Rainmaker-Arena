'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, Target, Trophy } from 'lucide-react';
import { Whale } from '@/types';
import { cn, formatTime } from '@/lib/utils';

interface WhaleCardProps {
  whale: Whale | null;
  currentHint: string | undefined;
  timeRemaining: number;
  score: number;
  streak: number;
  round: number;
  maxRounds: number;
  isRevealed?: boolean;
  className?: string;
}

export function WhaleCard({
  whale,
  currentHint,
  timeRemaining,
  score,
  streak,
  round,
  maxRounds,
  isRevealed = false,
  className
}: WhaleCardProps) {
  const timePercentage = (timeRemaining / 60) * 100;
  const isLowTime = timeRemaining <= 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20",
        "backdrop-blur-xl border border-white/10 shadow-2xl",
        className
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            animate={{
              y: [-20, -100],
              x: [Math.random() * 400, Math.random() * 400],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{score.toLocaleString()}</span>
            </motion.div>
            
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 bg-orange-500/20 rounded-full px-4 py-2"
              >
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-bold">{streak}x</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-white/60 text-sm">Round</div>
              <div className="text-white font-bold">{round}/{maxRounds}</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <motion.div
          className="mb-6"
          animate={{ scale: isLowTime ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className={cn(
                "w-5 h-5",
                isLowTime ? "text-red-400" : "text-blue-400"
              )} />
              <span className="text-white/80">Time Remaining</span>
            </div>
            <span className={cn(
              "font-mono font-bold text-lg",
              isLowTime ? "text-red-400" : "text-white"
            )}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors duration-300",
                isLowTime 
                  ? "bg-gradient-to-r from-red-500 to-red-600" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}
              style={{ width: `${timePercentage}%` }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Whale silhouette or revealed */}
        <div className="mb-6">
          {isRevealed && whale ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-4 p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src={whale.avatar} 
                  alt={whale.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{whale.name}</h3>
                <p className="text-white/60">{whale.description}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center justify-center p-12 bg-white/5 rounded-2xl border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    clipPath: "polygon(0% 40%, 20% 20%, 80% 20%, 100% 40%, 90% 80%, 10% 80%)"
                  }}
                />
                <Target className="w-8 h-8 text-white/60 mx-auto" />
                <p className="text-white/60 mt-2">Mystery Whale</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Current hint */}
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-400/20"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-sm">💡</span>
              </div>
              <div>
                <h4 className="text-cyan-300 font-semibold mb-2">Hint</h4>
                <p className="text-white/90 leading-relaxed">{currentHint}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 