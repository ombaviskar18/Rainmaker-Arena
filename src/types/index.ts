export interface Whale {
  id: number;
  name: string;
  address: string;
  description: string;
  hints: string[];
  funFacts: string[];
  avatar: string;
}

export interface GameState {
  currentWhale: Whale | null;
  currentHintIndex: number;
  score: number;
  streak: number;
  timeRemaining: number;
  gameStatus: 'waiting' | 'playing' | 'paused' | 'ended';
  round: number;
  maxRounds: number;
}

export interface Player {
  address?: string;
  name?: string;
  score: number;
  avatar?: string;
  isConnected: boolean;
}

export interface GuessResult {
  isCorrect: boolean;
  points: number;
  timeBonus: number;
  streakBonus: number;
  message: string;
}

export interface GameMessage {
  id: string;
  type: 'hint' | 'guess' | 'result' | 'system';
  content: string;
  timestamp: Date;
  player?: Player;
  isBot?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  score: number;
  gamesPlayed: number;
  accuracy: number;
} 