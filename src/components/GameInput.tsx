'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Lightbulb, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameInputProps {
  onGuess: (guess: string) => void;
  onHintRequest: () => void;
  onReset: () => void;
  disabled?: boolean;
  hasMoreHints?: boolean;
  className?: string;
}

export function GameInput({
  onGuess,
  onHintRequest,
  onReset,
  disabled = false,
  hasMoreHints = false,
  className
}: GameInputProps) {
  const [guess, setGuess] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = () => {
    if (!guess.trim() || disabled) return;
    
    onGuess(guess.trim());
    setGuess('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleHintClick = () => {
    if (!hasMoreHints) {
      triggerShake();
      return;
    }
    onHintRequest();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6",
        className
      )}
    >
      <div className="space-y-4">
        {/* Input field */}
        <div className="relative">
          <motion.input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Who is this crypto whale? 🐋"
            className={cn(
              "w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl",
              "text-white placeholder-white/50 text-lg",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50",
              "transition-all duration-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          />
          
          {/* Send button inside input */}
          <motion.button
            onClick={handleSubmit}
            disabled={!guess.trim() || disabled}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-lg",
              "bg-gradient-to-r from-blue-500 to-purple-500",
              "flex items-center justify-center",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
            whileHover={{ scale: guess.trim() && !disabled ? 1.1 : 1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={handleHintClick}
            disabled={disabled}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg",
              "border border-white/20 text-white/80",
              hasMoreHints 
                ? "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-400/30" 
                : "bg-gray-500/20 opacity-50",
              "transition-all duration-300",
              "disabled:cursor-not-allowed"
            )}
            whileHover={{ scale: hasMoreHints ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            animate={isShaking && !hasMoreHints ? { x: [-2, 2, -2, 2, 0] } : {}}
          >
            <Lightbulb className="w-4 h-4" />
            <span>{hasMoreHints ? 'Get Hint' : 'No More Hints'}</span>
          </motion.button>

          <motion.button
            onClick={onReset}
            disabled={disabled}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg",
              "bg-red-500/20 hover:bg-red-500/30 border border-red-400/30",
              "text-white/80 transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Game</span>
          </motion.button>
        </div>

        {/* Tips */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            💡 Tip: Think about famous crypto personalities, collectors, or founders
          </p>
        </div>
      </div>
    </motion.div>
  );
} 