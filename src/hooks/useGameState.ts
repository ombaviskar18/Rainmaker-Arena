'use client';

import { useState, useEffect, useCallback } from 'react';
import { Whale, GameState, GuessResult } from '@/types';
import { getRandomElement, calculateScore } from '@/lib/utils';
import famousWallets from '@/data/famousWallets.json';

const INITIAL_GAME_STATE: GameState = {
  currentWhale: null,
  currentHintIndex: 0,
  score: 0,
  streak: 0,
  timeRemaining: 60,
  gameStatus: 'waiting',
  round: 1,
  maxRounds: 10,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [usedWhales, setUsedWhales] = useState<Set<number>>(new Set());

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.gameStatus === 'playing' && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && gameState.gameStatus === 'playing') {
      // Time up - move to next round
      nextRound();
    }

    return () => clearInterval(interval);
  }, [gameState.gameStatus, gameState.timeRemaining]);

  const startGame = useCallback(() => {
    const firstWhale = selectRandomWhale();
    setGameState({
      ...INITIAL_GAME_STATE,
      currentWhale: firstWhale,
      gameStatus: 'playing',
    });
    setUsedWhales(new Set([firstWhale.id]));
  }, []);

  const selectRandomWhale = useCallback((): Whale => {
    const availableWhales = famousWallets.filter(whale => !usedWhales.has(whale.id));
    
    if (availableWhales.length === 0) {
      // Reset used whales if all have been used
      setUsedWhales(new Set());
      return getRandomElement(famousWallets);
    }
    
    return getRandomElement(availableWhales);
  }, [usedWhales]);

  const makeGuess = useCallback((guess: string): GuessResult => {
    if (!gameState.currentWhale || gameState.gameStatus !== 'playing') {
      return {
        isCorrect: false,
        points: 0,
        timeBonus: 0,
        streakBonus: 0,
        message: 'Game not active'
      };
    }

    const isCorrect = guess.toLowerCase().trim() === gameState.currentWhale.name.toLowerCase();
    const points = isCorrect ? calculateScore(
      gameState.timeRemaining,
      gameState.streak,
      gameState.currentHintIndex
    ) : 0;

    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        streak: prev.streak + 1,
      }));
      
      // Auto-advance to next round after a short delay
      setTimeout(() => {
        nextRound();
      }, 2000);
    } else {
      setGameState(prev => ({
        ...prev,
        streak: 0,
      }));
    }

    return {
      isCorrect,
      points,
      timeBonus: Math.floor(gameState.timeRemaining / 5) * 10,
      streakBonus: gameState.streak * 25,
      message: isCorrect ? '🎉 Correct!' : '❌ Try again!'
    };
  }, [gameState]);

  const getNextHint = useCallback(() => {
    if (!gameState.currentWhale || gameState.currentHintIndex >= gameState.currentWhale.hints.length - 1) {
      return null;
    }

    setGameState(prev => ({
      ...prev,
      currentHintIndex: prev.currentHintIndex + 1
    }));

    return gameState.currentWhale.hints[gameState.currentHintIndex + 1];
  }, [gameState]);

  const nextRound = useCallback(() => {
    if (gameState.round >= gameState.maxRounds) {
      // Game over
      setGameState(prev => ({
        ...prev,
        gameStatus: 'ended'
      }));
      return;
    }

    const nextWhale = selectRandomWhale();
    setGameState(prev => ({
      ...prev,
      currentWhale: nextWhale,
      currentHintIndex: 0,
      timeRemaining: 60,
      round: prev.round + 1,
    }));
    
    setUsedWhales(prev => new Set([...prev, nextWhale.id]));
  }, [gameState.round, gameState.maxRounds, selectRandomWhale]);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    setUsedWhales(new Set());
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  return {
    gameState,
    startGame,
    makeGuess,
    getNextHint,
    nextRound,
    resetGame,
    pauseGame,
    currentHint: gameState.currentWhale?.hints[gameState.currentHintIndex],
    hasMoreHints: gameState.currentWhale && gameState.currentHintIndex < gameState.currentWhale.hints.length - 1,
  };
} 