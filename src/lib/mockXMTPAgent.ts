export interface GameMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'player' | 'bot' | 'system' | 'whale_alert' | 'mcq_question' | 'mcq_answer';
  metadata?: {
    questionId?: string;
    options?: string[];
    correctAnswer?: string;
    isCorrect?: boolean;
  };
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint1: string;
  hint2: string;
  hint3: string;
  points: number;
  timeLimit: number; // seconds
}

export interface GameSession {
  id: string;
  playerAddress: string;
  currentQuestion: MCQQuestion | null;
  score: number;
  hintsUsed: number;
  questionsAnswered: number;
  isActive: boolean;
  startTime: Date;
  timeRemaining?: number;
}

export class MockXMTPWhaleAgent {
  private activeSessions: Map<string, GameSession> = new Map();
  private messageHandlers: ((message: GameMessage, session: GameSession) => void)[] = [];
  private whaleQuestions: MCQQuestion[] = [];
  private botAddress: string;

  constructor() {
    this.botAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    this.loadWhaleQuestions();
    console.log('🤖 Mock XMTP Agent initialized with address:', this.botAddress);
  }

  private loadWhaleQuestions() {
    this.whaleQuestions = [
      {
        id: 'q1',
        question: '🐋 Who is known as the creator of Ethereum and often makes large charitable donations?',
        options: ['A) Charles Hoskinson', 'B) Vitalik Buterin', 'C) Gavin Wood', 'D) Joseph Lubin'],
        correctAnswer: 'B',
        hint1: 'This person is from Canada and studied at University of Waterloo',
        hint2: 'They proposed Ethereum in a whitepaper in 2013',
        hint3: 'Their wallet address starts with 0xd8dA6BF2...',
        points: 100,
        timeLimit: 60
      },
      {
        id: 'q2',
        question: '🎭 Which whale is famous for collecting NFTs and has the Twitter handle @punk6529?',
        options: ['A) Punk6529', 'B) Pranksy', 'C) WhaleShark', 'D) Beeple'],
        correctAnswer: 'A',
        hint1: 'They are obsessed with decentralization and open metaverse',
        hint2: 'They created the "Open Metaverse" movement',
        hint3: 'Their wallet holds thousands of NFTs including rare CryptoPunks',
        points: 100,
        timeLimit: 60
      },
      {
        id: 'q3',
        question: '🃏 Which whale was one of the earliest and biggest NFT collectors, especially CryptoPunks?',
        options: ['A) Beanie', 'B) Pranksy', 'C) Steve Aoki', 'D) Gary Vee'],
        correctAnswer: 'B',
        hint1: 'They started collecting NFTs before it was mainstream',
        hint2: 'They have made millions from flipping NFTs',
        hint3: 'Their collection includes rare Punks and Art Blocks pieces',
        points: 100,
        timeLimit: 60
      },
      {
        id: 'q4',
        question: '🦈 Who created the $WHALE token backed by valuable NFTs?',
        options: ['A) Mr. Rain', 'B) PriceShark', 'C) Rainmaker Arena', 'D) Crypto Prophet'],
        correctAnswer: 'B',
        hint1: 'They tokenized their NFT collection into a social token',
        hint2: 'The $WHALE token represents fractional ownership of rare NFTs',
        hint3: 'They have one of the largest NFT collections in the world',
        points: 100,
        timeLimit: 60
      },
      {
        id: 'q5',
        question: '👑 Which whale became famous for buying expensive NFTs and later founded a DAO?',
        options: ['A) Beanie', 'B) Dingaling', 'C) Vincent Van Dough', 'D) Cozomo de Medici'],
        correctAnswer: 'A',
        hint1: 'They bought expensive Azuki and CloneX NFTs',
        hint2: 'They later created a DAO focused on NFT investments',
        hint3: 'Their spending habits made headlines in the NFT space',
        points: 100,
        timeLimit: 60
      }
    ];
  }

  public async sendWhaleAlert(alert: {
    type: string;
    amount: string;
    whale: string;
    details: string;
  }) {
    console.log('🚨 Mock whale alert:', alert.details);
    // In a real implementation, this would send via XMTP
  }

  public onMessage(handler: (message: GameMessage, session: GameSession) => void) {
    this.messageHandlers.push(handler);
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public getBotAddress(): string {
    return this.botAddress;
  }

  public getSessionStats(sessionId: string): GameSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Simulate starting a game session
  public simulateGameStart(): GameSession {
    const sessionId = `session_${Date.now()}`;
    const session: GameSession = {
      id: sessionId,
      playerAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      currentQuestion: this.whaleQuestions[0],
      score: 0,
      hintsUsed: 0,
      questionsAnswered: 0,
      isActive: true,
      startTime: new Date(),
      timeRemaining: 60
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  // Simulate answering a question
  public simulateAnswer(sessionId: string, answer: string): { isCorrect: boolean; newScore: number } {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.currentQuestion) {
      return { isCorrect: false, newScore: 0 };
    }

    const isCorrect = answer === session.currentQuestion.correctAnswer;
    let pointsEarned = 0;

    if (isCorrect) {
      pointsEarned = session.currentQuestion.points - (session.hintsUsed * 10);
      session.score += Math.max(pointsEarned, 0);
    }

    session.questionsAnswered++;
    session.hintsUsed = 0; // Reset for next question

    // Move to next question
    if (session.questionsAnswered < this.whaleQuestions.length) {
      session.currentQuestion = this.whaleQuestions[session.questionsAnswered];
    } else {
      session.currentQuestion = null;
      session.isActive = false;
    }

    return { isCorrect, newScore: session.score };
  }

  // Get current question for a session
  public getCurrentQuestion(sessionId: string): MCQQuestion | null {
    const session = this.activeSessions.get(sessionId);
    return session?.currentQuestion || null;
  }
} 