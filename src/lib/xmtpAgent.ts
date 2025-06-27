import { Client, type Conversation } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';

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
  conversation: Conversation;
  currentQuestion: MCQQuestion | null;
  score: number;
  hintsUsed: number;
  questionsAnswered: number;
  isActive: boolean;
  startTime: Date;
  timeRemaining?: number;
}

export class XMTPWhaleAgent {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private activeSessions: Map<string, GameSession> = new Map();
  private messageHandlers: ((message: GameMessage, session: GameSession) => void)[] = [];
  private whaleQuestions: MCQQuestion[] = [];

  constructor() {
    this.initializeAgent();
    this.loadWhaleQuestions();
  }

  private async initializeAgent() {
    try {
      // Create wallet for the agent
      this.wallet = Wallet.createRandom();
      console.log('🤖 XMTP Agent Address:', this.wallet.address);

      // Initialize XMTP client
      this.client = await Client.create(this.wallet, {
        env: 'dev' // Use 'production' for mainnet
      });

      console.log('✅ XMTP Agent initialized successfully!');
      this.startListening();
    } catch (error) {
      console.error('❌ Failed to initialize XMTP Agent:', error);
    }
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

  private async startListening() {
    if (!this.client) return;

    try {
      const stream = await this.client.conversations.stream();
      
      for await (const conversation of stream) {
        console.log('🔗 New conversation with:', conversation.peerAddress);
        this.handleConversation(conversation);
      }
    } catch (error) {
      console.error('❌ Error starting listener:', error);
    }
  }

  private async handleConversation(conversation: Conversation) {
    try {
      const messageStream = await conversation.streamMessages();
      
      for await (const message of messageStream) {
        if (message.senderAddress === this.client?.address) continue;
        
        const gameMessage: GameMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: message.content,
          sender: message.senderAddress,
          timestamp: message.sent,
          type: 'player'
        };

        await this.handlePlayerMessage(gameMessage, conversation);
      }
    } catch (error) {
      console.error('❌ Error handling conversation:', error);
    }
  }

  private async handlePlayerMessage(message: GameMessage, conversation: Conversation) {
    const sessionId = conversation.peerAddress;
    let session = this.activeSessions.get(sessionId);

    // Handle commands
    if (message.content.startsWith('/')) {
      await this.handleCommand(message, conversation, session);
      return;
    }

    // If no active session, prompt to start
    if (!session) {
      await this.sendWelcomeMessage(conversation);
      return;
    }

    // Handle MCQ answers
    if (session.currentQuestion) {
      await this.handleMCQAnswer(message, conversation, session);
    }

    // Notify handlers
    this.messageHandlers.forEach(handler => handler(message, session!));
  }

  private async handleCommand(message: GameMessage, conversation: Conversation, session?: GameSession) {
    const command = message.content.toLowerCase().trim();
    const sessionId = conversation.peerAddress;

    switch (command) {
      case '/start':
        await this.startNewGame(conversation, message.sender);
        break;
      
      case '/hint':
        if (session?.currentQuestion) {
          await this.provideHint(conversation, session);
        } else {
          await this.sendMessage(conversation, '❌ No active question! Start a game with /start');
        }
        break;
      
      case '/score':
        if (session) {
          await this.showScore(conversation, session);
        } else {
          await this.sendMessage(conversation, '❌ No active game! Start with /start');
        }
        break;
      
      case '/help':
        await this.showHelp(conversation);
        break;
      
      case '/quit':
        if (session) {
          this.activeSessions.delete(sessionId);
          await this.sendMessage(conversation, '👋 Game ended! Thanks for playing. Start again with /start');
        }
        break;
      
      default:
        await this.sendMessage(conversation, '❓ Unknown command! Use /help to see available commands');
    }
  }

  private async startNewGame(conversation: Conversation, playerAddress: string) {
    const sessionId = conversation.peerAddress;
    
    // End existing session if any
    if (this.activeSessions.has(sessionId)) {
      this.activeSessions.delete(sessionId);
    }

    // Create new session
    const session: GameSession = {
      id: sessionId,
      playerAddress,
      conversation,
      currentQuestion: null,
      score: 0,
      hintsUsed: 0,
      questionsAnswered: 0,
      isActive: true,
      startTime: new Date()
    };

    this.activeSessions.set(sessionId, session);

    await this.sendMessage(conversation, `🎮 **RAINMAKER ARENA GAME STARTED!** 🌊

🎯 **How to Play:**
• Answer MCQ questions about famous crypto whales
• Type A, B, C, or D to answer
• Use /hint for clues (reduces points)
• Score points for correct answers!

**Commands:**
• /hint - Get a hint (-10 points)
• /score - Check your score
• /quit - End game
• /help - Show help

🚀 **Ready? Let's hunt some whales!**`);

    // Start first question
    await this.nextQuestion(conversation, session);
  }

  private async nextQuestion(conversation: Conversation, session: GameSession) {
    if (session.questionsAnswered >= this.whaleQuestions.length) {
      await this.endGame(conversation, session);
      return;
    }

    const questionIndex = session.questionsAnswered;
    const question = this.whaleQuestions[questionIndex];
    session.currentQuestion = question;
    session.timeRemaining = question.timeLimit;

    const questionMessage = `📊 **Question ${questionIndex + 1}/${this.whaleQuestions.length}**

${question.question}

${question.options.join('\n')}

⏰ Time: ${question.timeLimit}s | 💰 Points: ${question.points}
💡 Hint available with /hint (-10 points)

**Type your answer (A, B, C, or D):**`;

    await this.sendMessage(conversation, questionMessage);

    // Start timer
    setTimeout(() => {
      if (session.currentQuestion?.id === question.id && session.isActive) {
        this.handleTimeout(conversation, session);
      }
    }, question.timeLimit * 1000);
  }

  private async handleMCQAnswer(message: GameMessage, conversation: Conversation, session: GameSession) {
    const answer = message.content.trim().toUpperCase();
    const question = session.currentQuestion!;

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      await this.sendMessage(conversation, '❌ Please answer with A, B, C, or D');
      return;
    }

    const isCorrect = answer === question.correctAnswer;
    let pointsEarned = 0;

    if (isCorrect) {
      pointsEarned = question.points - (session.hintsUsed * 10);
      session.score += Math.max(pointsEarned, 0);
      
      await this.sendMessage(conversation, `🎉 **CORRECT!** 

✅ ${question.options.find(opt => opt.startsWith(question.correctAnswer))}

💰 Points earned: ${pointsEarned}
📈 Total score: ${session.score}

🔥 Moving to next question...`);
    } else {
      await this.sendMessage(conversation, `❌ **WRONG!** 

✅ Correct answer: ${question.options.find(opt => opt.startsWith(question.correctAnswer))}

📈 Total score: ${session.score}

💪 Better luck next time!`);
    }

    session.questionsAnswered++;
    session.currentQuestion = null;
    session.hintsUsed = 0; // Reset hints for next question

    // Wait 3 seconds before next question
    setTimeout(() => {
      if (session.isActive) {
        this.nextQuestion(conversation, session);
      }
    }, 3000);
  }

  private async provideHint(conversation: Conversation, session: GameSession) {
    const question = session.currentQuestion!;
    session.hintsUsed++;

    let hint = '';
    if (session.hintsUsed === 1) {
      hint = question.hint1;
    } else if (session.hintsUsed === 2) {
      hint = question.hint2;
    } else if (session.hintsUsed === 3) {
      hint = question.hint3;
    } else {
      await this.sendMessage(conversation, '❌ No more hints available for this question!');
      return;
    }

    await this.sendMessage(conversation, `💡 **Hint ${session.hintsUsed}/3:** ${hint}

⚠️ Hint penalty: -10 points from your score`);
  }

  private async handleTimeout(conversation: Conversation, session: GameSession) {
    await this.sendMessage(conversation, `⏰ **TIME UP!** 

✅ Correct answer: ${session.currentQuestion!.options.find(opt => opt.startsWith(session.currentQuestion!.correctAnswer))}

📈 Score: ${session.score}

⏭️ Moving to next question...`);

    session.questionsAnswered++;
    session.currentQuestion = null;
    session.hintsUsed = 0;

    setTimeout(() => {
      if (session.isActive) {
        this.nextQuestion(conversation, session);
      }
    }, 3000);
  }

  private async endGame(conversation: Conversation, session: GameSession) {
    session.isActive = false;
    
    const duration = Math.round((Date.now() - session.startTime.getTime()) / 1000);
    let performance = '';
    
    if (session.score >= 400) performance = '🏆 WHALE MASTER!';
    else if (session.score >= 300) performance = '🥈 WHALE EXPERT!';
    else if (session.score >= 200) performance = '🥉 RAINMAKER!';
    else performance = '🐟 KEEP PRACTICING!';

    await this.sendMessage(conversation, `🎮 **GAME COMPLETED!** 🎮

${performance}

📊 **Final Stats:**
• Score: ${session.score} points
• Questions: ${session.questionsAnswered}/${this.whaleQuestions.length}
• Time: ${duration}s

🚀 **Want to play again? Type /start**

Thanks for playing Rainmaker Arena! 🌊`);

    this.activeSessions.delete(session.id);
  }

  private async showScore(conversation: Conversation, session: GameSession) {
    await this.sendMessage(conversation, `📊 **Current Score:** ${session.score} points
🎯 Questions answered: ${session.questionsAnswered}/${this.whaleQuestions.length}
⏱️ Game time: ${Math.round((Date.now() - session.startTime.getTime()) / 1000)}s`);
  }

  private async showHelp(conversation: Conversation) {
    await this.sendMessage(conversation, `🆘 **RAINMAKER ARENA HELP** 🌊

🎮 **Commands:**
• /start - Start new game
• /hint - Get hint (-10 points)
• /score - Show current score
• /quit - End current game
• /help - Show this help

🎯 **How to Play:**
• Answer MCQ questions about crypto whales
• Type A, B, C, or D for answers
• Use hints wisely (they cost points!)
• Try to get the highest score!

🏆 **Scoring:**
• Correct answer: 100 points
• Hint penalty: -10 points each
• Time bonus: Faster = more points

Ready to hunt? Type /start! 🚀`);
  }

  private async sendWelcomeMessage(conversation: Conversation) {
    await this.sendMessage(conversation, `👋 **Welcome to Rainmaker Arena!** 🌊

🎮 The ultimate crypto whale trivia game!

Test your knowledge of famous crypto personalities and whales. Answer MCQ questions, use hints strategically, and climb the leaderboard!

🚀 **Ready to start?** Type /start
ℹ️ **Need help?** Type /help`);
  }

  private async sendMessage(conversation: Conversation, content: string) {
    try {
      await conversation.send(content);
      console.log('📤 Sent message:', content.slice(0, 100) + '...');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }

  // Public methods for external integration
  public async sendWhaleAlert(alert: {
    type: string;
    amount: string;
    whale: string;
    details: string;
  }) {
    const alertMessage = `🚨 **WHALE ALERT!** 🚨

${alert.details}

**Type /start to play and learn more about crypto whales!** 🎯`;

    // Send to all active sessions
    for (const session of this.activeSessions.values()) {
      if (session.isActive) {
        await this.sendMessage(session.conversation, alertMessage);
      }
    }
  }

  public onMessage(handler: (message: GameMessage, session: GameSession) => void) {
    this.messageHandlers.push(handler);
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public getBotAddress(): string | null {
    return this.wallet?.address || null;
  }

  public getSessionStats(sessionId: string): GameSession | null {
    return this.activeSessions.get(sessionId) || null;
  }
} 