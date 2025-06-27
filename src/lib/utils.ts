import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return '';
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateScore(timeRemaining: number, streak: number, hintIndex: number): number {
  const basePoints = 100;
  const timeBonus = Math.floor(timeRemaining / 5) * 10; // 10 points per 5 seconds
  const streakBonus = streak * 25; // 25 points per streak
  const hintPenalty = hintIndex * 15; // -15 points per hint used
  
  return Math.max(10, basePoints + timeBonus + streakBonus - hintPenalty);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const GAME_CONFIG = {
  DEFAULT_TIME_LIMIT: 60, // seconds
  MAX_HINTS: 3,
  MAX_ROUNDS: 10,
  POINTS_PER_CORRECT: 100,
  STREAK_MULTIPLIER: 1.5,
} as const; 