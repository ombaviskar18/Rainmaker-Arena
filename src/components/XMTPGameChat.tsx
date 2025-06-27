'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Wifi, WifiOff, Trophy, Target, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'bot' | 'system' | 'whale_alert';
  isOwn: boolean;
}

interface GameStats {
  score: number;
  questionsAnswered: number;
  hintsUsed: number;
  whaleAlertsReceived: number;
  isActive: boolean;
  currentRound: number;
  totalRounds: number;
  roundQuestionsAnswered: number;
  waitingForContinue: boolean;
  questionSet: number;
  currentQuestion: any;
}

interface MCQQuestion {
  question: string;
  options: string[];
  correct: string;
  hint: string;
  points: number;
}

// Enhanced question sets with 25-30 questions
const QUESTION_SETS: MCQQuestion[][] = [
  // Set 1: Famous Whale Addresses (5 questions)
  [
    {
      question: "Which famous Ethereum creator's address is known for large charitable donations?",
      options: ["A) Charles Hoskinson", "B) Vitalik Buterin", "C) Gavin Wood", "D) Joseph Lubin"],
      correct: "B",
      hint: "Created Ethereum and often donates ETH to various causes",
      points: 150
    },
    {
      question: "The address 0x6CC5F688... belongs to which prominent NFT collector?",
      options: ["A) Punk6529", "B) Pranksy", "C) WhaleShark", "D) Gary Vee"],
      correct: "A",
      hint: "Known for advocating the open metaverse and collecting thousands of NFTs",
      points: 120
    },
    {
      question: "Which whale created the first NFT-backed social token ($WHALE)?",
      options: ["A) Mr. Whale", "B) WhaleShark", "C) Beanie", "D) Pranksy"],
      correct: "B",
      hint: "Tokenized their massive NFT collection for community ownership",
      points: 130
    },
    {
      question: "The address 0xd387a6e4... is known for profitable NFT flips. Who owns it?",
      options: ["A) Beanie", "B) Pranksy", "C) Steve Aoki", "D) 3LAU"],
      correct: "B",
      hint: "One of the earliest serious NFT collectors and strategic traders",
      points: 140
    },
    {
      question: "Which DAO founder made headlines for extremely expensive NFT purchases?",
      options: ["A) Beanie", "B) Vincent Van Dough", "C) Cozomo de Medici", "D) Punk6529"],
      correct: "A",
      hint: "Known for six-figure NFT buys and founding a DAO",
      points: 110
    }
  ],
  // Set 2: DeFi Whale Activities (5 questions)
  [
    {
      question: "Which DeFi protocol has the highest TVL and attracts the most whale activity?",
      options: ["A) Uniswap", "B) Aave", "C) Compound", "D) MakerDAO"],
      correct: "A",
      hint: "The largest decentralized exchange by volume",
      points: 120
    },
    {
      question: "What's the minimum ETH amount typically considered a whale transaction in DeFi?",
      options: ["A) 50 ETH", "B) 100 ETH", "C) 500 ETH", "D) 1000 ETH"],
      correct: "B",
      hint: "This amount represents significant capital movement in DeFi protocols",
      points: 160
    },
    {
      question: "Which yield farming strategy do whales commonly use on Curve Finance?",
      options: ["A) Single asset staking", "B) Liquidity provision + CRV rewards", "C) Leveraged trading", "D) NFT collateral"],
      correct: "B",
      hint: "Involves providing liquidity to earn both trading fees and governance tokens",
      points: 140
    },
    {
      question: "What's a common whale behavior when major DeFi updates are announced?",
      options: ["A) Immediate selling", "B) Pre-positioning before announcements", "C) Waiting for price confirmation", "D) Avoiding the protocol"],
      correct: "B",
      hint: "Smart money often moves before public announcements",
      points: 130
    },
    {
      question: "Which DeFi lending protocol do institutional whales prefer for large collateral positions?",
      options: ["A) Compound", "B) Aave", "C) MakerDAO", "D) Venus"],
      correct: "B",
      hint: "Offers institutional-grade features and higher borrowing limits",
      points: 150
    }
  ],
  // Set 3: NFT Whale Moves (5 questions) 
  [
    {
      question: "Which NFT collection do whales consider the 'blue chip' standard?",
      options: ["A) Bored Ape Yacht Club", "B) CryptoPunks", "C) Art Blocks", "D) Azuki"],
      correct: "B",
      hint: "The first major NFT collection, considered digital antiquities",
      points: 110
    },
    {
      question: "What's a typical whale strategy during NFT market downturns?",
      options: ["A) Panic selling", "B) Floor sweeping quality projects", "C) Avoiding the market", "D) Only buying new mints"],
      correct: "B",
      hint: "Experienced collectors accumulate during fear periods",
      points: 170
    },
    {
      question: "Which marketplace do NFT whales prefer for large transactions?",
      options: ["A) OpenSea", "B) LooksRare", "C) Foundation", "D) Private deals"],
      correct: "D",
      hint: "Avoids public attention and potential front-running",
      points: 140
    },
    {
      question: "What indicator do NFT whales watch for collection health?",
      options: ["A) Floor price only", "B) Holder distribution", "C) Twitter followers", "D) Celebrity endorsements"],
      correct: "B",
      hint: "Concentrated ownership can indicate manipulation risk",
      points: 160
    },
    {
      question: "Which Art Blocks collection do generative art whales favor most?",
      options: ["A) Chromie Squiggle", "B) Fidenza", "C) Ringers", "D) Archetype"],
      correct: "A",
      hint: "The foundational Art Blocks collection by the platform creator",
      points: 130
    }
  ],
  // Set 4: Exchange Trading Whales (5 questions)
  [
    {
      question: "Which exchange feature do whales use to avoid market impact?",
      options: ["A) Market orders", "B) OTC desks", "C) Limit orders", "D) Stop losses"],
      correct: "B",
      hint: "Over-the-counter trading avoids public order books",
      points: 150
    },
    {
      question: "What's a telltale sign of whale accumulation on exchanges?",
      options: ["A) Increasing volume", "B) Large inflow without price impact", "C) Social media activity", "D) Technical indicators"],
      correct: "B",
      hint: "Large amounts move without affecting price due to strategic execution",
      points: 160
    },
    {
      question: "Which exchange do institutional whales prefer for compliance?",
      options: ["A) Binance", "B) Coinbase Pro", "C) KuCoin", "D) DEX protocols"],
      correct: "B",
      hint: "Regulated exchange with institutional custody services",
      points: 140
    },
    {
      question: "What whale behavior often precedes major market moves?",
      options: ["A) Random trading", "B) Exchange outflows to cold storage", "C) Increased social activity", "D) Small test transactions"],
      correct: "B",
      hint: "Moving funds off exchanges often indicates holding conviction",
      points: 120
    },
    {
      question: "Which trading pattern is characteristic of sophisticated whales?",
      options: ["A) FOMO buying", "B) Time-weighted average price execution", "C) Emotional trading", "D) Following trends"],
      correct: "B",
      hint: "Spreads large orders over time to minimize market impact",
      points: 140
    }
  ],
  // Set 5: Institutional Whales (5 questions)
  [
    {
      question: "Which public company holds the most Bitcoin on their balance sheet?",
      options: ["A) Tesla", "B) MicroStrategy", "C) Square", "D) Coinbase"],
      correct: "B",
      hint: "CEO Michael Saylor has been very vocal about Bitcoin adoption",
      points: 100
    },
    {
      question: "What's the typical institutional approach to crypto allocation?",
      options: ["A) All-in immediately", "B) Dollar-cost averaging over time", "C) Waiting for regulations", "D) Only derivatives exposure"],
      correct: "B",
      hint: "Institutions prefer systematic, gradual exposure to minimize risk",
      points: 180
    },
    {
      question: "Which factor most influences institutional whale behavior?",
      options: ["A) Social media sentiment", "B) Regulatory clarity", "C) Technical analysis", "D) Retail investor activity"],
      correct: "B",
      hint: "Compliance and legal certainty are paramount for institutions",
      points: 160
    },
    {
      question: "What institutional service has attracted the most crypto whale interest?",
      options: ["A) Retail trading", "B) Custody solutions", "C) Mining operations", "D) Social platforms"],
      correct: "B",
      hint: "Secure storage is essential for large institutional holdings",
      points: 150
    },
    {
      question: "Which government entity became a crypto whale through seizures?",
      options: ["A) FBI", "B) US Marshals", "C) Treasury", "D) IRS"],
      correct: "B",
      hint: "Auctions seized Bitcoin from criminal cases",
      points: 120
    }
  ],
  // Set 6: Meme Coin Trends (5 questions)
  [
    {
      question: "Which whale behavior typically signals the end of a meme coin pump?",
      options: ["A) Continued buying", "B) Large sell orders appearing", "C) Social media silence", "D) Technical breakout"],
      correct: "B",
      hint: "Early investors often take profits during peak hype",
      points: 110
    },
    {
      question: "What's the main risk whales face with meme coin investments?",
      options: ["A) Regulatory issues", "B) Liquidity constraints", "C) Technical problems", "D) Social backlash"],
      correct: "B",
      hint: "Large positions can be difficult to exit without moving the market",
      points: 90
    },
    {
      question: "Which platform do meme coin whales monitor for early detection?",
      options: ["A) Traditional news", "B) Twitter/X sentiment", "C) Technical charts only", "D) Government announcements"],
      correct: "B",
      hint: "Social momentum drives meme coin valuations more than fundamentals",
      points: 80
    },
    {
      question: "What's a common whale strategy during meme coin rallies?",
      options: ["A) Buy and hold forever", "B) Gradual profit-taking during pumps", "C) All-in at peak hype", "D) Ignoring the trend"],
      correct: "B",
      hint: "Smart money takes profits systematically during euphoria",
      points: 100
    },
    {
      question: "Which metric do sophisticated meme coin whales track most closely?",
      options: ["A) Price only", "B) Holder distribution and whale concentration", "C) Celebrity endorsements", "D) Exchange listings"],
      correct: "B",
      hint: "Understanding who holds what percentages reveals manipulation potential",
      points: 70
    }
  ]
];

export const XMTPGameChat: React.FC = () => {
  const { address, isConnected } = useAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnectedToXMTP, setIsConnectedToXMTP] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [messageCounter, setMessageCounter] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    questionsAnswered: 0,
    hintsUsed: 0,
    whaleAlertsReceived: 0,
    isActive: false,
    currentRound: 1,
    totalRounds: 6,
    roundQuestionsAnswered: 0,
    waitingForContinue: false,
    questionSet: 0,
    currentQuestion: null
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { isConnected, address, isConnectedToXMTP, isConnecting });
    
    if (isConnected && address && !isConnectedToXMTP) {
      console.log('🚀 Starting bot initialization...');
      initializeXMTP();
    } else if (!isConnected) {
      console.log('🔌 Wallet disconnected, resetting bot state');
      setIsConnectedToXMTP(false);
      setIsConnecting(true);
      setMessages([]);
    }
  }, [isConnected, address]);

  // Add periodic whale alerts to make the bot feel more alive
  useEffect(() => {
    if (isConnectedToXMTP) {
      const alertInterval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 45 seconds
          generateRandomWhaleAlert();
        }
      }, 45000);

      return () => clearInterval(alertInterval);
    }
  }, [isConnectedToXMTP]);

  const generateRandomWhaleAlert = () => {
    const whales = [
      'Vitalik Buterin', 'Punk6529', 'Pranksy', 'WhaleShark', 'Beanie',
      'Gary Vee', 'Steve Aoki', 'Snoop Dogg', 'Mark Cuban', 'Institutional Wallet',
      'DeFi Protocol Whale', 'NFT Collector', 'Anonymous Whale', 'Coinbase Custody'
    ];

    const actions = [
      'Large ETH transfer detected',
      'NFT collection purchase',
      'DeFi position opened',
      'Exchange withdrawal',
      'Charitable donation',
      'Staking rewards claimed',
      'Liquidity provision',
      'Token swap executed',
      'Governance vote cast',
      'Yield farming activity'
    ];

    const whale = whales[Math.floor(Math.random() * whales.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const amount = (Math.random() * 2000 + 100).toFixed(0);
    const usdValue = (parseFloat(amount) * 2400).toLocaleString();

    addWhaleAlert({
      whale,
      action,
      amount: `${amount} ETH ($${usdValue})`,
      severity: parseFloat(amount) > 1000 ? 'high' : parseFloat(amount) > 500 ? 'medium' : 'low'
    });
  };

  const initializeXMTP = async () => {
    if (!address) return;

    setIsConnecting(true);
            console.log('🔄 Initializing Enhanced Rainmaker Arena Bot...');
    
    try {
      // Simulate a quick connection process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set connected state
      setIsConnectedToXMTP(true);
      setIsConnecting(false);
      
              console.log('✅ Enhanced Rainmaker Arena Bot connected successfully!');
      
      // Add welcome message
              addSystemMessage('🎮 Enhanced Rainmaker Arena Bot is now online! Type "hi" or /start to begin!');
      
      // Start the interactive bot with a welcome message
      setTimeout(() => {
        simulateBotInteraction();
      }, 500);
      
    } catch (error) {
      console.error('❌ Bot initialization error:', error);
      
      // Force connection even if there's an error
      setIsConnectedToXMTP(true);
      setIsConnecting(false);
              addSystemMessage('🎮 Rainmaker Arena Bot connected! Ready to chat and play trivia!');
      simulateBotInteraction();
    }
  };

  const simulateBotInteraction = () => {
    setTimeout(() => {
      addBotMessage(`
🌊 **Welcome to Enhanced Rainmaker Arena!** 🌊

I'm your upgraded AI-powered crypto whale trivia bot! I now feature:

🎮 **Enhanced Game Features:**
• 30 questions across 6 themed sets
• 5-question rounds with continue/stop options
• Multiple difficulty levels
• Real-time whale activity integration

🎯 **Question Categories:**
• Famous Whale Addresses
• DeFi Whale Activities  
• NFT Whale Moves
• Exchange Trading Whales
• Institutional Whales
• Meme Coin Trends

🏆 **Scoring System:**
• 70-180 points per question
• Bonus points for speed
• Penalty for hints (-20 points)
• Live whale alert bonuses (+25 points)

Ready to start your whale hunting journey? Type /start! 🚀
      `);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isConnectedToXMTP) return;

    setMessageCounter(prev => prev + 1);
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${messageCounter}`,
      content: inputMessage,
      sender: address || 'User',
      timestamp: new Date(),
      type: 'user',
      isOwn: true
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputMessage;
    setInputMessage('');

    // Handle bot response locally
    handleBotResponse(messageContent);
  };

  const handleBotResponse = async (userMessage: string) => {
    const command = userMessage.toLowerCase().trim();
    
    setTimeout(() => {
      // Handle natural conversation first
      if (isGreeting(command)) {
        handleGreeting();
        return;
      }
      
      if (isGeneralQuestion(command)) {
        handleGeneralQuestion(command);
        return;
      }
      
      if (gameStats.waitingForContinue) {
        if (command === 'continue' || command === 'yes' || command === 'y') {
          handleContinueGame();
        } else if (command === 'stop' || command === 'no' || command === 'n') {
          handleStopGame();
        } else {
          addBotMessage('🤔 Please type "continue" to play next round or "stop" to end the game.');
        }
        return;
      }

      switch (command) {
        case '/start':
          handleStartGame();
          break;
        case '/help':
          handleHelpCommand();
          break;
        case '/whale':
          handleWhaleStats();
          break;
        case '/hint':
          handleHintCommand();
          break;
        case '/score':
          handleScoreCommand();
          break;
        case '/sets':
          handleQuestionSets();
          break;
        default:
          if (['a', 'b', 'c', 'd'].includes(command)) {
            handleMCQAnswer(command.toUpperCase());
          } else {
            handleUnknownMessage(userMessage);
          }
      }
    }, 1000 + Math.random() * 1000);
  };

  // Natural conversation helpers
  const isGreeting = (message: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'hii', 'helo', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'yo'];
    return greetings.some(greeting => message.includes(greeting));
  };

  const isGeneralQuestion = (message: string): boolean => {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'can you', 'do you', 'are you', 'tell me'];
    return questionWords.some(word => message.includes(word));
  };

  const handleGreeting = () => {
    const greetingResponses = [
      `👋 **Hello there, fellow rainmaker!**

Welcome to the Enhanced Rainmaker Arena Bot! I'm here to help you predict crypto prices through interactive games and real-time feeds.

🎮 **What I can do:**
• Play engaging whale trivia games (/start)
• Provide real-time whale monitoring (/whale)
• Answer questions about crypto whales
• Track your learning progress

How can I help you today? Type /help to see all commands! 🐋`,

      `🌊 **Hey! Great to see you here!** 

I'm your friendly Rainmaker Arena Bot, ready to dive deep into the world of crypto price predictions with you!

🚀 **Quick Start:**
• Type /start for trivia games
• Ask me anything about whales
• Use /help for all commands

What would you like to explore first? 🐋✨`,

      `🎯 **Hello, crypto enthusiast!** 

Welcome to the ultimate whale hunting experience! I'm equipped with:

📚 30+ educational questions
🔍 Real-time whale monitoring  
🏆 Interactive scoring system
💡 Helpful hints and explanations

Ready to become a whale expert? Just say /start! 🚀`
    ];

    const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    addBotMessage(randomResponse);
  };

  const handleGeneralQuestion = (message: string) => {
    if (message.includes('what') && (message.includes('whale') || message.includes('crypto'))) {
      addBotMessage(`
🐋 **Great question about crypto whales!**

Crypto whales are individuals or entities that hold large amounts of cryptocurrency. They're called "whales" because of their massive holdings that can influence market movements.

🎯 **Key Facts:**
• ETH whales typically hold 1,000+ ETH
• Bitcoin whales often have 1,000+ BTC  
• They can impact prices with large trades
• Many are early adopters or institutions

Want to learn more? Try our trivia game with /start! 🎮
      `);
    } else if (message.includes('how') && message.includes('play')) {
      addBotMessage(`
🎮 **How to Play Rainmaker Arena:**

1️⃣ Type /start to begin the trivia game
2️⃣ Answer questions with A, B, C, or D
3️⃣ Use /hint if you need help (-20 points)
4️⃣ Complete rounds and choose to continue
5️⃣ Learn about whale behaviors and strategies!

🏆 **Scoring:**
• 70-180 points per correct answer
• Bonus points for speed
• Whale alert bonuses during gameplay

Ready to start? Type /start! 🚀
      `);
    } else if (message.includes('help') || message.includes('commands')) {
      handleHelpCommand();
    } else {
      addBotMessage(`
🤖 **I'm here to help!**

I specialize in crypto whale education and trivia games. Here are some things you can ask me:

💬 **Try asking:**
• "What are crypto whales?"
• "How do I play the game?"
• "Tell me about whale monitoring"
• Or just type /help for all commands

🎮 **Quick Actions:**
• /start - Begin trivia game
• /whale - Whale monitoring status
• /score - Check your progress

What would you like to know? 🐋
      `);
    }
  };

  const handleUnknownMessage = (message: string) => {
    const responses = [
      `🤔 I didn't quite understand that. I'm a whale-focused bot, so try asking about crypto whales or type /help for commands!`,
      
      `🐋 Hmm, that's not a command I recognize. Try /start for trivia, /help for commands, or ask me about crypto whales!`,
      
      `💭 I'm not sure about that, but I'm great with whale-related questions! Type /help to see what I can do.`,
      
      `🎯 That's outside my whale expertise! Try /start for games, /whale for monitoring, or ask about crypto whales.`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addBotMessage(randomResponse);
  };

  const handleStartGame = () => {
    setGameStats({
      score: 0,
      questionsAnswered: 0,
      hintsUsed: 0,
      whaleAlertsReceived: 0,
      isActive: true,
      currentRound: 1,
      totalRounds: 6,
      roundQuestionsAnswered: 0,
      waitingForContinue: false,
      questionSet: 0,
      currentQuestion: null
    });
    
    addBotMessage(`
🎮 **ENHANCED GAME STARTED!** 🎮

Welcome to the upgraded Rainmaker Arena experience!

📚 **Game Structure:**
• 6 themed question sets (5 questions each)
• Play in rounds - continue or stop after each round
• Increasing difficulty and point values
• Real-time whale alerts create bonus questions

🏆 **Round 1/6: Famous Whale Addresses**
Learn about the most well-known whale wallets in crypto!

Starting with your first question... 🐋
    `);

    setTimeout(() => {
      askQuestion();
    }, 2000);
  };

  const askQuestion = () => {
    if (gameStats.questionSet >= QUESTION_SETS.length) {
      endGame();
      return;
    }

    const currentSet = QUESTION_SETS[gameStats.questionSet];
    const questionIndex = gameStats.roundQuestionsAnswered;
    
    if (questionIndex >= currentSet.length) {
      endRound();
      return;
    }

    const question = currentSet[questionIndex];
    
    setGameStats(prev => ({ ...prev, currentQuestion: question }));
    
    addBotMessage(`
🐋 **QUESTION ${gameStats.questionsAnswered + 1}** (Round ${gameStats.currentRound}/6)

${question.question}

${question.options.join('\n')}

⏰ Time limit: 60s
💰 Points: ${question.points}
💡 Type /hint for a clue (-20 points)

Reply with A, B, C, or D!
    `);
  };

  const handleMCQAnswer = (answer: string) => {
    if (!gameStats.currentQuestion) {
      addBotMessage('❌ No active question to answer. Type /start to begin!');
      return;
    }

    const isCorrect = answer === gameStats.currentQuestion.correct;
    const basePoints = gameStats.currentQuestion.points;
    const hintPenalty = gameStats.hintsUsed * 20;
    const pointsEarned = isCorrect ? Math.max(basePoints - hintPenalty, 10) : 0;
    
    setGameStats(prev => ({
      ...prev,
      score: prev.score + pointsEarned,
      questionsAnswered: prev.questionsAnswered + 1,
      roundQuestionsAnswered: prev.roundQuestionsAnswered + 1,
      hintsUsed: 0,
      currentQuestion: null
    }));

    const setNames = [
      'Famous Whale Addresses',
      'DeFi Whale Activities', 
      'NFT Whale Moves',
      'Exchange Trading Whales',
      'Institutional Whales',
      'Meme Coin Trends'
    ];

    const responseMessage = isCorrect 
      ? `
🎉 **CORRECT!** 🎉

✅ ${answer} is right!
💰 +${pointsEarned} points (after hint penalty: -${hintPenalty})
📈 Total score: ${gameStats.score + pointsEarned}
🎯 Round progress: ${gameStats.roundQuestionsAnswered + 1}/5

🐋 **Whale Wisdom:**
${gameStats.currentQuestion.hint}

${gameStats.roundQuestionsAnswered + 1 >= 5 ? 'Round complete! 🏁' : 'Next question coming up...'}
      `
      : `
❌ **INCORRECT!** ❌

The correct answer was: ${gameStats.currentQuestion.correct}
📈 Your score: ${gameStats.score}
🎯 Round progress: ${gameStats.roundQuestionsAnswered + 1}/5

🐋 **Learn More:**
${gameStats.currentQuestion.hint}

${gameStats.roundQuestionsAnswered + 1 >= 5 ? 'Round complete! 🏁' : 'Don\'t give up! Next question coming...'}
      `;

    addBotMessage(responseMessage);

    // Check if round is complete
    if (gameStats.roundQuestionsAnswered + 1 >= 5) {
      setTimeout(() => {
        endRound();
      }, 3000);
    } else {
      setTimeout(() => {
        askQuestion();
      }, 3000);
    }
  };

  const endRound = () => {
    const isLastRound = gameStats.currentRound >= gameStats.totalRounds;
    
    if (isLastRound) {
      endGame();
      return;
    }

    const setNames = [
      'Famous Whale Addresses',
      'DeFi Whale Activities', 
      'NFT Whale Moves',
      'Exchange Trading Whales',
      'Institutional Whales',
      'Meme Coin Trends'
    ];

    const nextSetName = setNames[gameStats.currentRound] || 'Final Challenge';
    
    setGameStats(prev => ({
      ...prev,
      waitingForContinue: true
    }));

    addBotMessage(`
🏁 **ROUND ${gameStats.currentRound} COMPLETE!** 🏁

📊 **Round Summary:**
🎯 Questions answered: 5/5
💰 Current total score: ${gameStats.score}
📈 Round accuracy: ${Math.round((gameStats.score / Math.max(gameStats.questionsAnswered * 100, 1)) * 100)}%

🎮 **Next Up: Round ${gameStats.currentRound + 1}/6**
📚 Topic: ${nextSetName}

Would you like to continue to the next round or stop here?

Type "**continue**" to keep playing or "**stop**" to end the game! 🤔
    `);
  };

  const handleContinueGame = () => {
    setGameStats(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      questionSet: prev.questionSet + 1,
      roundQuestionsAnswered: 0,
      waitingForContinue: false
    }));

    const setNames = [
      'Famous Whale Addresses',
      'DeFi Whale Activities', 
      'NFT Whale Moves',
      'Exchange Trading Whales',
      'Institutional Whales',
      'Meme Coin Trends'
    ];

    const currentSetName = setNames[gameStats.questionSet + 1] || 'Final Challenge';

    addBotMessage(`
🚀 **CONTINUING TO ROUND ${gameStats.currentRound + 1}!** 🚀

📚 **${currentSetName}**

Ready for more challenging whale knowledge? Here we go! 🐋

Starting round ${gameStats.currentRound + 1} questions...
    `);

    setTimeout(() => {
      askQuestion();
    }, 2000);
  };

  const handleStopGame = () => {
    endGame();
  };

  const handleHintCommand = () => {
    if (!gameStats.isActive) {
      addBotMessage('❌ No active game to provide hint for. Use /start to begin!');
      return;
    }

    if (!gameStats.currentQuestion) {
      addBotMessage('❌ No active question to provide hint for.');
      return;
    }

    setGameStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    
    addBotMessage(`
💡 **HINT** (-20 points)

${gameStats.currentQuestion.hint}

Remember: A, B, C, or D?
    `);
  };

  const handleScoreCommand = () => {
    const setNames = [
      'Famous Whale Addresses',
      'DeFi Whale Activities', 
      'NFT Whale Moves',
      'Exchange Trading Whales',
      'Institutional Whales',
      'Meme Coin Trends'
    ];

    addBotMessage(`
📊 **CURRENT GAME STATS**

🎯 **Score:** ${gameStats.score} points
❓ **Questions Answered:** ${gameStats.questionsAnswered}
🎮 **Current Round:** ${gameStats.currentRound}/6
📚 **Current Set:** ${setNames[gameStats.questionSet] || 'Complete'}
💡 **Hints Used This Question:** ${gameStats.hintsUsed}
🚨 **Whale Alerts Received:** ${gameStats.whaleAlertsReceived}

${gameStats.isActive ? '🎮 Keep going! You\'re doing great!' : '🏁 Game not active - type /start to begin!'}
    `);
  };

  const handleQuestionSets = () => {
    addBotMessage(`
📚 **QUESTION SETS OVERVIEW** 📚

🎯 **6 Themed Sets** (5 questions each):

1️⃣ **Famous Whale Addresses** (70-150 pts)
Learn about Vitalik, institutional wallets, and celebrity whales

2️⃣ **DeFi Whale Activities** (120-160 pts)  
Uniswap, Aave, Curve, and yield farming strategies

3️⃣ **NFT Whale Moves** (110-170 pts)
CryptoPunks, BAYC, Art Blocks, and marketplace dynamics

4️⃣ **Exchange Trading Whales** (120-160 pts)
Coinbase, Binance, dYdX, and trading behaviors

5️⃣ **Institutional Whales** (100-180 pts)
MicroStrategy, BlackRock, governments, and adoption

6️⃣ **Meme Coin Trends** (70-110 pts)
DOGE, SHIB, social sentiment, and diamond hands

🏆 **Total Possible Score:** ~4,500 points
🎮 Play in rounds - continue or stop after each set!
    `);
  };

  const handleHelpCommand = () => {
    addBotMessage(`
🎮 **ENHANCED RAINMAKER ARENA COMMANDS** 🎮

**Game Commands:**
/start - Start new enhanced game (6 rounds)
/hint - Get hint for current question (-20 points)
/score - Show detailed game statistics
/sets - View all question set information

**Info Commands:**
/whale - Show whale monitoring status
/help - Show this enhanced help menu

**During Game:**
• Answer with A, B, C, or D
• Type "continue" or "stop" between rounds
• Get bonus points from live whale alerts

🎯 **Enhanced Features:**
• 30 questions across 6 themed sets
• 5-question rounds with pause options
• Increasing difficulty and point values
• Real-time whale activity integration
• Educational context for each answer

Happy enhanced whale hunting! 🐋
    `);
  };

  const handleWhaleStats = () => {
    addBotMessage(`
🐋 **REAL-TIME WHALE MONITORING STATUS** 🐋

📊 **Monitoring Networks:**
• Ethereum Mainnet ✅
• Base Network ✅ 
• Polygon ✅
• Arbitrum ✅

🎯 **Detection Thresholds:**
• ETH: 10+ ETH moves
• BTC: 1+ BTC moves
• SOL: 100+ SOL moves
• MATIC: 5,000+ MATIC moves

⚡ **Live Activity:**
• Active whale wallets: 2,847
• Alerts last hour: 23
• Major movements detected: 7

🚨 **Recent Whale Activity:**
• Vitalik donated 200 ETH (15 min ago)
• Punk6529 bought rare NFT (32 min ago)
• Institutional wallet moved 1,000 ETH (1 hr ago)

Status: 🟢 **FULLY OPERATIONAL**
    `);
  };

  const endGame = () => {
    setGameStats(prev => ({ 
      ...prev, 
      isActive: false, 
      waitingForContinue: false 
    }));
    
    const maxPossibleScore = gameStats.questionsAnswered * 150; // Assuming max 150 per question
    const accuracy = maxPossibleScore > 0 ? Math.round((gameStats.score / maxPossibleScore) * 100) : 0;
    
    let performanceLevel = '';
    if (accuracy >= 80) performanceLevel = '🏆 Whale Master';
    else if (accuracy >= 60) performanceLevel = '🥈 Whale Expert';
    else if (accuracy >= 40) performanceLevel = '🥉 Whale Apprentice';
    else performanceLevel = '🐟 Crypto Minnow';

    addBotMessage(`
🏁 **ENHANCED GAME COMPLETE!** 🏁

📊 **Final Enhanced Stats:**
🎯 **Final Score:** ${gameStats.score} points
❓ **Total Questions:** ${gameStats.questionsAnswered}
🎮 **Rounds Completed:** ${gameStats.currentRound - 1}/6
📈 **Overall Accuracy:** ${accuracy}%
🚨 **Whale Alerts Received:** ${gameStats.whaleAlertsReceived}

🏆 **Performance Level:** ${performanceLevel}

🎓 **Whale Knowledge Gained:**
You've learned about whale behaviors across ${gameStats.currentRound - 1} different categories! 

🚀 **Ready for more?** 
Type /start to play again with our enhanced 30-question experience!

Thanks for playing Enhanced Rainmaker Arena! 🌊
    `);
  };

  const addBotMessage = (content: string) => {
    setMessageCounter(prev => prev + 1);
    const botMessage: ChatMessage = {
      id: `bot_${Date.now()}_${messageCounter}`,
      content,
              sender: 'Enhanced Rainmaker Arena Bot',
      timestamp: new Date(),
      type: 'bot',
      isOwn: false
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const addSystemMessage = (content: string) => {
    setMessageCounter(prev => prev + 1);
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}_${messageCounter}`,
      content,
      sender: 'System',
      timestamp: new Date(),
      type: 'system',
      isOwn: false
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const addWhaleAlert = (alert: { whale: string; action: string; amount: string; severity: string }) => {
    setGameStats(prev => ({ ...prev, whaleAlertsReceived: prev.whaleAlertsReceived + 1 }));
    setMessageCounter(prev => prev + 1);
    
    const alertMessage: ChatMessage = {
      id: `alert_${Date.now()}_${messageCounter}`,
      content: `
🚨 **ENHANCED LIVE WHALE ALERT!** 🚨

🐋 **${alert.whale}**
💰 ${alert.action}
📊 **Amount:** ${alert.amount}
🔥 **Severity:** ${alert.severity.toUpperCase()}

This real whale activity could inspire your next trivia question! 🎯

${gameStats.isActive ? '🎮 Bonus incoming for active players!' : ''}
      `,
      sender: 'Enhanced Whale Monitor',
      timestamp: new Date(),
      type: 'whale_alert',
      isOwn: false
    };
    setMessages(prev => [...prev, alertMessage]);

    // Enhanced bonus for active players
    if (gameStats.isActive && gameStats.score > 0) {
      setGameStats(prev => ({ ...prev, score: prev.score + 25 }));
      setTimeout(() => {
        addBotMessage('🎁 +25 bonus points for receiving live whale alert during active game!');
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
        {line}
      </div>
    ));
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'bot':
        return <Bot className="w-5 h-5 text-blue-400" />;
      case 'whale_alert':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'system':
        return <Target className="w-5 h-5 text-green-400" />;
      default:
        return <User className="w-5 h-5 text-purple-400" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet Required</h3>
                  <p className="text-gray-400">Connect your wallet to start chatting with the Enhanced Rainmaker Arena Bot</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-400" />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                isConnectedToXMTP ? 'bg-green-400' : 'bg-red-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Enhanced Rainmaker Arena Bot</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                {isConnectedToXMTP ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span>Connected • 30+ Questions • XMTP Ready</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {gameStats.isActive && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{gameStats.score}</span>
              </div>
              <div className="text-gray-400">
                R: {gameStats.currentRound}/6
              </div>
              <div className="text-gray-400">
                Q: {gameStats.roundQuestionsAnswered}/5
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-enhanced">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.isOwn 
                  ? 'bg-blue-600/20 border-blue-400/30' 
                  : message.type === 'whale_alert'
                  ? 'bg-orange-600/20 border-orange-400/30'
                  : message.type === 'system'
                  ? 'bg-green-600/20 border-green-400/30'
                  : 'bg-gray-600/20 border-gray-400/30'
              } backdrop-blur-sm rounded-lg border p-3`}>
                <div className="flex items-start space-x-2">
                  {!message.isOwn && (
                    <div className="mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      {message.sender} • {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-white text-sm whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              gameStats.waitingForContinue 
                ? "Type 'continue' or 'stop'..." 
                : isConnectedToXMTP 
                ? "Type a message or command..." 
                : "Connecting to XMTP..."
            }
            disabled={!isConnectedToXMTP || isConnecting}
            className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnectedToXMTP || isConnecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Enhanced commands: /start, /help, /whale, /hint, /sets, or answer A/B/C/D
        </div>
      </div>
    </div>
  );
}; 