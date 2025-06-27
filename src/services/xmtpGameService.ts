import { Client, type Conversation } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { RealTimeWhaleMonitor, type WhaleAlert } from '../lib/realTimeWhaleMonitor';
import { RealTimeWhaleDetector, type RealWhaleActivity } from '../lib/realTimeWhaleDetector';
import { getXMTPConfig, getWhaleMonitorConfig } from '../lib/env';

export interface XMTPGameMessage {
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
    whaleAlert?: WhaleAlert;
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
  timeLimit: number;
  whaleContext?: {
    whaleAddress: string;
    whaleName: string;
    recentActivity: string;
  };
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
  whaleAlertsReceived: number;
}

export class XMTPGameService {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private whaleMonitor: RealTimeWhaleMonitor | null = null;
  private realWhaleDetector: RealTimeWhaleDetector | null = null;
  private activeSessions: Map<string, GameSession> = new Map();
  private messageHandlers: ((message: XMTPGameMessage, session: GameSession) => void)[] = [];
  private isInitialized = false;
  private recentWhaleActivities: RealWhaleActivity[] = [];

  private whaleQuestions: MCQQuestion[] = [
    {
      id: 'vitalik_q1',
      question: '🐋 A whale just moved 2,000 ETH from the address 0xd8dA6BF2... Who is this famous whale?',
      options: ['A) Charles Hoskinson', 'B) Vitalik Buterin', 'C) Gavin Wood', 'D) Joseph Lubin'],
      correctAnswer: 'B',
      hint1: 'This person is the creator of Ethereum',
      hint2: 'They often donate to charitable causes',
      hint3: 'Their wallet is known for large charitable transfers',
      points: 150,
      timeLimit: 45,
      whaleContext: {
        whaleAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        whaleName: 'Vitalik Buterin',
        recentActivity: 'Large charitable donation detected'
      }
    },
    {
      id: 'punk6529_q1',
      question: '🎭 Alert! A whale bought 5 rare CryptoPunks from 0x6CC5F688... Which collector is this?',
      options: ['A) Punk6529', 'B) Pranksy', 'C) WhaleShark', 'D) Gary Vee'],
      correctAnswer: 'A',
      hint1: 'They advocate for decentralization and the open metaverse',
      hint2: 'Twitter handle matches their wallet behavior',
      hint3: 'Known for accumulating thousands of NFTs',
      points: 120,
      timeLimit: 60,
      whaleContext: {
        whaleAddress: '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b',
        whaleName: 'Punk6529',
        recentActivity: 'Major NFT acquisition spree'
      }
    },
    {
      id: 'pranksy_q1',
      question: '🃏 Breaking: Whale 0xd387a6e4... just flipped an Art Blocks piece for 50 ETH profit. Who is this?',
      options: ['A) Beanie', 'B) Pranksy', 'C) Steve Aoki', 'D) 3LAU'],
      correctAnswer: 'B',
      hint1: 'One of the earliest serious NFT collectors',
      hint2: 'Known for strategic flipping and rare acquisitions',
      hint3: 'Has made millions from NFT trading',
      points: 140,
      timeLimit: 50,
      whaleContext: {
        whaleAddress: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
        whaleName: 'Pranksy',
        recentActivity: 'Profitable NFT flip detected'
      }
    },
    {
      id: 'whaleshark_q1',
      question: '🦈 $WHALE token backing just increased! Which whale manages this social token at 0x020cA66C...?',
      options: ['A) Mr. Rain', 'B) PriceShark', 'C) Rainmaker Arena', 'D) Ocean Master'],
      correctAnswer: 'B',
      hint1: 'Created the first NFT-backed social token',
      hint2: 'Owns one of the world\'s largest NFT collections',
      hint3: 'Tokenized their collection for community ownership',
      points: 130,
      timeLimit: 55,
      whaleContext: {
        whaleAddress: '0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872',
        whaleName: 'WhaleShark',
        recentActivity: '$WHALE token vault updated'
      }
    },
    {
      id: 'beanie_q1',
      question: '👑 Whale alert! 0x8bc47Be1... just bought a Bored Ape for 100 ETH. Which DAO founder is this?',
      options: ['A) Beanie', 'B) Dingaling', 'C) Vincent Van Dough', 'D) Cozomo de Medici'],
      correctAnswer: 'A',
      hint1: 'Known for extremely expensive NFT purchases',
      hint2: 'Founded a DAO after massive NFT spending',
      hint3: 'Made headlines for six-figure NFT buys',
      points: 110,
      timeLimit: 40,
      whaleContext: {
        whaleAddress: '0x8bc47Be1E3baCF3b77e8C1930f2073F5DD6C9f24',
        whaleName: 'Beanie',
        recentActivity: 'High-value NFT purchase'
      }
    }
  ];

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  private async initializeService() {
    try {
      console.log('🚀 Initializing XMTP Game Service...');
      
      // Initialize XMTP client
      await this.initializeXMTPClient();
      
      // Initialize whale monitoring
      await this.initializeWhaleMonitoring();
      
      console.log('✅ XMTP Game Service initialized successfully!');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize XMTP Game Service:', error);
    }
  }

  private async initializeXMTPClient() {
    const config = getXMTPConfig();
    
    // Create or load wallet for the game bot
    this.wallet = Wallet.createRandom();
    console.log('🤖 Game Bot Address:', this.wallet.address);

    // Initialize XMTP client
    this.client = await Client.create(this.wallet, {
      env: config.env as 'dev' | 'production'
    });

    console.log('✅ XMTP Client initialized');
    this.startListening();
  }

  private async initializeWhaleMonitoring() {
    const config = getWhaleMonitorConfig();
    
    // Initialize legacy whale monitor for demo purposes
    this.whaleMonitor = new RealTimeWhaleMonitor(config);
    
    // Listen for whale alerts
    this.whaleMonitor.on('whaleAlert', (alert: WhaleAlert) => {
      this.handleWhaleAlert(alert);
    });

    // Initialize real-time whale detector
    this.realWhaleDetector = new RealTimeWhaleDetector({
      alchemyApiKey: config.alchemyApiKey || '',
      etherscanApiKey: config.etherscanApiKey || '',
      minTransactionUSD: 50000, // $50K minimum
      updateInterval: 60000 // Update every minute
    });

    // Listen for real whale activities
    this.realWhaleDetector.on('whaleActivity', (activity: RealWhaleActivity) => {
      this.handleRealWhaleActivity(activity);
    });

    // Start both monitoring systems
    await this.whaleMonitor.startMonitoring();
    await this.realWhaleDetector.startDetection();
    
    console.log('✅ Both whale monitoring systems started');
  }

  private async startListening() {
    if (!this.client) return;

    try {
      console.log('👂 Starting to listen for XMTP conversations...');
      const stream = await this.client.conversations.stream();
      
      for await (const conversation of stream) {
        console.log('🔗 New conversation with:', conversation.peerAddress);
        this.handleConversation(conversation);
      }
    } catch (error) {
      console.error('❌ Error starting XMTP listener:', error);
    }
  }

  private async handleConversation(conversation: Conversation) {
    try {
      const messageStream = await conversation.streamMessages();
      
      for await (const message of messageStream) {
        // Skip messages from the bot itself
        if (message.senderAddress === this.client?.address) continue;
        
        const gameMessage: XMTPGameMessage = {
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

  private async handlePlayerMessage(message: XMTPGameMessage, conversation: Conversation) {
    const sessionId = conversation.peerAddress;
    let session = this.activeSessions.get(sessionId);

    console.log(`📨 Message from ${message.sender}: ${message.content}`);

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
    this.messageHandlers.forEach(handler => {
      if (session) handler(message, session);
    });
  }

  private async handleCommand(message: XMTPGameMessage, conversation: Conversation, session?: GameSession) {
    const command = message.content.toLowerCase().trim();
    const sessionId = conversation.peerAddress;

    switch (command) {
      case '/start':
        await this.startNewGame(conversation, message.sender);
        break;
      
      case '/hint':
        if (session && session.currentQuestion) {
          await this.provideHint(conversation, session);
        } else {
          await this.sendMessage(conversation, '❌ No active question to provide hint for. Use /start to begin a game!');
        }
        break;
      
      case '/score':
        if (session) {
          await this.showScore(conversation, session);
        } else {
          await this.sendMessage(conversation, '📊 No active game session. Use /start to begin!');
        }
        break;
      
      case '/help':
        await this.showHelp(conversation);
        break;
      
      case '/stop':
        if (session) {
          await this.endGame(conversation, session);
        } else {
          await this.sendMessage(conversation, 'No active game to stop.');
        }
        break;
      
      case '/whale':
        await this.showWhaleStats(conversation);
        break;
      
      default:
        await this.sendMessage(conversation, 
          '❓ Unknown command. Type /help for available commands.'
        );
    }
  }

  private async startNewGame(conversation: Conversation, playerAddress: string) {
    const sessionId = conversation.peerAddress;
    
    // End existing session if any
    if (this.activeSessions.has(sessionId)) {
      await this.endGame(conversation, this.activeSessions.get(sessionId)!);
    }

    const session: GameSession = {
      id: sessionId,
      playerAddress,
      conversation,
      currentQuestion: null,
      score: 0,
      hintsUsed: 0,
      questionsAnswered: 0,
      isActive: true,
      startTime: new Date(),
      whaleAlertsReceived: 0
    };

    this.activeSessions.set(sessionId, session);

    await this.sendMessage(conversation, `
🎮 **RAINMAKER ARENA GAME STARTED!** 🎮

Welcome to the ultimate crypto whale trivia game! 

🎯 **How to Play:**
• Answer MCQ questions about famous crypto whales
• Each correct answer earns you points
• Use /hint for clues (reduces points)
• Get alerts about real whale activities
• Climb the leaderboard!

🏆 **Scoring:**
• Correct answer: 100-150 points
• Using hint: -20 points per hint
• Speed bonus: +50 points for quick answers

Ready? Let's hunt some whales! 🐋
`);

    // Start with first question
    await this.nextQuestion(conversation, session);
  }

  private async nextQuestion(conversation: Conversation, session: GameSession) {
    if (!session.isActive) return;

    // Get random question
    const randomIndex = Math.floor(Math.random() * this.whaleQuestions.length);
    const question = this.whaleQuestions[randomIndex];
    session.currentQuestion = question;
    session.hintsUsed = 0;

    const questionMessage = `
🐋 **WHALE QUESTION #${session.questionsAnswered + 1}**

${question.question}

${question.options.join('\n')}

⏰ Time limit: ${question.timeLimit}s
💰 Points: ${question.points}
💡 Type /hint for a clue (-20 points)

Reply with A, B, C, or D!
`;

    await this.sendMessage(conversation, questionMessage);

    // Set timeout for question
    setTimeout(() => {
      if (session.currentQuestion?.id === question.id) {
        this.handleTimeout(conversation, session);
      }
    }, question.timeLimit * 1000);
  }

  private async handleMCQAnswer(message: XMTPGameMessage, conversation: Conversation, session: GameSession) {
    const answer = message.content.toUpperCase().trim();
    const question = session.currentQuestion!;
    
    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      await this.sendMessage(conversation, '❌ Please reply with A, B, C, or D');
      return;
    }

    const isCorrect = answer === question.correctAnswer;
    session.questionsAnswered++;
    session.currentQuestion = null;

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = question.points - (session.hintsUsed * 20);
      session.score += pointsEarned;
    }

    const responseMessage = isCorrect 
      ? `
🎉 **CORRECT!** 🎉

✅ ${answer} is right!
💰 +${pointsEarned} points
📈 Total score: ${session.score}

${question.whaleContext ? `
🐋 **Whale Context:**
📍 Whale: ${question.whaleContext.whaleName}
📊 Activity: ${question.whaleContext.recentActivity}
🔗 Address: ${question.whaleContext.whaleAddress.slice(0, 10)}...
` : ''}

Ready for the next challenge?
`
      : `
❌ **INCORRECT!** ❌

The correct answer was: ${question.correctAnswer}
📈 Your score: ${session.score}

${question.whaleContext ? `
🐋 **Whale Context:**
📍 Whale: ${question.whaleContext.whaleName}
📊 Activity: ${question.whaleContext.recentActivity}
` : ''}

Don't give up! Next question coming...
`;

    await this.sendMessage(conversation, responseMessage);

    // Continue with next question after short delay
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
    switch (session.hintsUsed) {
      case 1:
        hint = question.hint1;
        break;
      case 2:
        hint = question.hint2;
        break;
      case 3:
        hint = question.hint3;
        break;
      default:
        await this.sendMessage(conversation, '❌ No more hints available for this question!');
        return;
    }

    await this.sendMessage(conversation, `
💡 **HINT #${session.hintsUsed}** (-20 points)

${hint}

Remember: A, B, C, or D?
`);
  }

  private async handleTimeout(conversation: Conversation, session: GameSession) {
    if (!session.currentQuestion) return;

    await this.sendMessage(conversation, `
⏰ **TIME'S UP!**

The correct answer was: ${session.currentQuestion.correctAnswer}

Don't worry, let's try another one!
`);

    session.currentQuestion = null;
    session.questionsAnswered++;

    // Continue with next question
    setTimeout(() => {
      if (session.isActive) {
        this.nextQuestion(conversation, session);
      }
    }, 2000);
  }

  private async handleWhaleAlert(alert: WhaleAlert) {
    console.log('🚨 Whale Alert received:', alert);

    // Send alert to all active sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (session.isActive) {
        session.whaleAlertsReceived++;
        
        const alertMessage = `
🚨 **LIVE WHALE ALERT!** 🚨

🐋 ${alert.whale}
💰 ${alert.action}
📊 Amount: ${alert.amount}
🔥 Severity: ${alert.severity.toUpperCase()}

This could be your next trivia question! 🎯
`;

        await this.sendMessage(session.conversation, alertMessage);

        // Bonus points for active players
        if (session.score > 0) {
          session.score += 25;
          await this.sendMessage(session.conversation, '🎁 +25 bonus points for receiving live whale alert!');
        }
      }
    }
  }

  private async handleRealWhaleActivity(activity: RealWhaleActivity) {
    console.log('🐋 Real whale activity detected:', activity);
    
    // Store the activity
    this.recentWhaleActivities.unshift(activity);
    if (this.recentWhaleActivities.length > 20) {
      this.recentWhaleActivities.pop();
    }

    // Create MCQ question based on real activity
    const dynamicQuestion = this.createDynamicQuestionFromActivity(activity);
    
    // Send real-time alert to all active sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (session.isActive) {
        try {
          await this.sendRealWhaleAlert(session.conversation, activity);
          
          // Optionally trigger a new question based on this activity
          if (Math.random() < 0.3) { // 30% chance to trigger a question
            session.currentQuestion = dynamicQuestion;
            await this.sendMCQQuestion(session.conversation, dynamicQuestion, session);
          }
        } catch (error) {
          console.error(`Failed to send real whale alert to session ${sessionId}:`, error);
        }
      }
    }
  }

  private createDynamicQuestionFromActivity(activity: RealWhaleActivity): MCQQuestion {
    const options = [
      `A) ${activity.whale_name}`,
      'B) Vitalik Buterin',
      'C) Punk6529',
      'D) Anonymous Whale'
    ];

    // Shuffle options so correct answer isn't always A
    const shuffled = this.shuffleArray([...options]);
    const correctIndex = shuffled.findIndex(opt => opt.includes(activity.whale_name));
    const correctLetter = String.fromCharCode(65 + correctIndex); // A, B, C, D

    return {
      id: `real_${activity.id}`,
      question: `🚨 LIVE ALERT: ${activity.description}. Which whale made this transaction?`,
      options: shuffled,
      correctAnswer: correctLetter,
      hint1: `This transaction was worth over $${Math.floor(activity.amount_usd / 1000)}K`,
      hint2: `The whale's address is ${activity.whale_address.slice(0, 6)}...${activity.whale_address.slice(-4)}`,
      hint3: `This activity happened ${activity.severity === 'critical' ? 'very recently' : 'recently'} on-chain`,
      points: activity.severity === 'critical' ? 200 : activity.severity === 'high' ? 150 : 100,
      timeLimit: 60,
      whaleContext: {
        whaleAddress: activity.whale_address,
        whaleName: activity.whale_name,
        recentActivity: activity.description
      }
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async sendRealWhaleAlert(conversation: Conversation, activity: RealWhaleActivity) {
    const alertMessage = `🚨 **REAL-TIME WHALE ALERT** 🚨

${activity.description}

💰 **Amount:** ${activity.amount_eth.toFixed(2)} ETH ($${activity.amount_usd.toLocaleString()})
🔗 **Transaction:** ${activity.transaction_hash.slice(0, 10)}...
⚡ **Severity:** ${activity.severity.toUpperCase()}
⏰ **Time:** ${new Date(activity.timestamp).toLocaleTimeString()}

This is LIVE data from the blockchain! 📊`;

    await this.sendMessage(conversation, alertMessage);
  }

  private async endGame(conversation: Conversation, session: GameSession) {
    session.isActive = false;
    
    const gameTime = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const accuracy = session.questionsAnswered > 0 ? (session.score / (session.questionsAnswered * 150) * 100).toFixed(1) : '0';

    await this.sendMessage(conversation, `
🏁 **GAME OVER!** 🏁

📊 **Final Stats:**
🎯 Score: ${session.score} points
❓ Questions: ${session.questionsAnswered}
📈 Accuracy: ${accuracy}%
🚨 Whale Alerts: ${session.whaleAlertsReceived}
⏱️ Time Played: ${gameTime}s

Thanks for playing Rainmaker Arena! 🌊
Type /start to play again!
`);

    this.activeSessions.delete(session.id);
  }

  private async showScore(conversation: Conversation, session: GameSession) {
    await this.sendMessage(conversation, `
📊 **CURRENT SCORE**

🎯 Points: ${session.score}
❓ Questions Answered: ${session.questionsAnswered}
💡 Hints Used: ${session.hintsUsed}
🚨 Whale Alerts: ${session.whaleAlertsReceived}

Keep going! 🐋
`);
  }

  private async showHelp(conversation: Conversation) {
    await this.sendMessage(conversation, `
🎮 **RAINMAKER ARENA COMMANDS** 🎮

/start - Start a new game
/hint - Get a hint for current question (-20 points)
/score - Show current score
/whale - Show whale monitoring stats
/stop - End current game
/help - Show this help message

🎯 **How to Play:**
• Answer A, B, C, or D for each question
• Earn points for correct answers
• Get real-time whale alerts
• Climb the leaderboard!

Happy hunting! 🐋
`);
  }

  private async showWhaleStats(conversation: Conversation) {
    const activeWhales = this.whaleMonitor?.getKnownWhales().size || 0;
    const isMonitoring = this.whaleMonitor?.isMonitoringActive() || false;

    await this.sendMessage(conversation, `
🐋 **WHALE MONITORING STATS** 🐋

📡 Status: ${isMonitoring ? '🟢 Active' : '🔴 Inactive'}
🎯 Tracking: ${activeWhales} whale addresses
📊 Networks: Ethereum, Base, Polygon

Recent activity will trigger new trivia questions! 🎮
`);
  }

  private async sendMessage(conversation: Conversation, content: string) {
    try {
      await conversation.send(content);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }

  // Public API methods
  public isServiceReady(): boolean {
    return this.isInitialized && this.client !== null && this.whaleMonitor !== null;
  }

  public getBotAddress(): string | null {
    return this.wallet?.address || null;
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public getSessionStats(sessionId: string): GameSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  public onMessage(handler: (message: XMTPGameMessage, session: GameSession) => void) {
    this.messageHandlers.push(handler);
  }

  public getRecentWhaleActivities(): RealWhaleActivity[] {
    return this.recentWhaleActivities;
  }

  public getWhaleWallets() {
    return this.realWhaleDetector?.getWhaleWallets() || [];
  }

  public isRealWhaleDetectorActive(): boolean {
    return this.realWhaleDetector?.isActive() || false;
  }

  public async shutdown() {
    console.log('🛑 Shutting down XMTP Game Service...');
    
    if (this.whaleMonitor) {
      this.whaleMonitor.stopMonitoring();
    }
    
    if (this.realWhaleDetector) {
      this.realWhaleDetector.stopDetection();
    }
    
    // Close all active sessions
    for (const session of this.activeSessions.values()) {
      session.isActive = false;
    }
    
    this.activeSessions.clear();
    this.isInitialized = false;
    
    console.log('✅ XMTP Game Service shutdown complete');
  }
}

// Export singleton instance
export const xmtpGameService = new XMTPGameService(); 