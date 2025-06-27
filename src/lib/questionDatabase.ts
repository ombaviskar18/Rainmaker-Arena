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
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'whale_identity' | 'nft_collecting' | 'defi_activity' | 'trading_history' | 'crypto_events';
}

export const WHALE_QUESTIONS: MCQQuestion[] = [
  // Easy Questions
  {
    id: 'q1',
    question: '🐋 Who is known as the creator of Ethereum and often makes large charitable donations?',
    options: ['A) Charles Hoskinson', 'B) Vitalik Buterin', 'C) Gavin Wood', 'D) Joseph Lubin'],
    correctAnswer: 'B',
    hint1: 'This person is from Canada and studied at University of Waterloo',
    hint2: 'They proposed Ethereum in a whitepaper in 2013',
    hint3: 'Their wallet address starts with 0xd8dA6BF2...',
    points: 100,
    timeLimit: 60,
    difficulty: 'easy',
    category: 'whale_identity'
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
    timeLimit: 60,
    difficulty: 'easy',
    category: 'nft_collecting'
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
    timeLimit: 60,
    difficulty: 'easy',
    category: 'nft_collecting'
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
    timeLimit: 60,
    difficulty: 'easy',
    category: 'defi_activity'
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
    timeLimit: 60,
    difficulty: 'easy',
    category: 'nft_collecting'
  },

  // Medium Questions
  {
    id: 'q6',
    question: '⚡ What is the nickname for the whale who sold the top of Bitcoin in 2021?',
    options: ['A) The Oracle', 'B) Diamond Hands', 'C) The Top Seller', 'D) Bitcoin Whale'],
    correctAnswer: 'A',
    hint1: 'This trader made a legendary sale near $69,000',
    hint2: 'They often share market insights on Twitter',
    hint3: 'Known for timing the market perfectly multiple times',
    points: 150,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'trading_history'
  },
  {
    id: 'q7',
    question: '🎨 Which celebrity whale bought a Bored Ape and changed their Twitter PFP?',
    options: ['A) Eminem', 'B) Steve Aoki', 'C) Jimmy Fallon', 'D) All of the above'],
    correctAnswer: 'D',
    hint1: 'Multiple celebrities joined the Bored Ape trend',
    hint2: 'This happened during the 2021-2022 NFT boom',
    hint3: 'Many paid 6-figure amounts for their apes',
    points: 150,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'nft_collecting'
  },
  {
    id: 'q8',
    question: '🏛️ Which DeFi protocol was co-founded by a famous whale known as "Kain"?',
    options: ['A) Uniswap', 'B) Synthetix', 'C) Compound', 'D) Aave'],
    correctAnswer: 'B',
    hint1: 'This protocol focuses on synthetic assets',
    hint2: 'Kain Warwick is the founder\'s real name',
    hint3: 'The protocol uses SNX tokens for staking',
    points: 150,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'defi_activity'
  },
  {
    id: 'q9',
    question: '💎 What did the whale "DiamondHands" famously refuse to do during the 2022 bear market?',
    options: ['A) Sell their Bitcoin', 'B) Buy more ETH', 'C) Trade NFTs', 'D) Use DeFi'],
    correctAnswer: 'A',
    hint1: 'This whale became famous for HODLing',
    hint2: 'They tweeted diamond emoji repeatedly',
    hint3: 'Never sold despite 70% portfolio decline',
    points: 150,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'trading_history'
  },
  {
    id: 'q10',
    question: '🌊 Which whale is known for their "Ocean Cleanup" environmental NFT project?',
    options: ['A) Mr. Beast', 'B) 3LAU', 'C) WhaleShark', 'D) Captain Planet'],
    correctAnswer: 'C',
    hint1: 'They combined NFTs with environmental causes',
    hint2: 'Part of their $WHALE token ecosystem',
    hint3: 'Donated significant funds to ocean conservation',
    points: 150,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'crypto_events'
  },

  // Hard Questions
  {
    id: 'q11',
    question: '🔥 Which whale accidentally burned $100M+ worth of tokens due to a smart contract bug?',
    options: ['A) Andre Cronje', 'B) Do Kwon', 'C) Arthur Hayes', 'D) Sam Bankman-Fried'],
    correctAnswer: 'A',
    hint1: 'This happened during the DeFi summer of 2020',
    hint2: 'The whale was experimenting with new protocols',
    hint3: 'They later helped improve DeFi security standards',
    points: 200,
    timeLimit: 30,
    difficulty: 'hard',
    category: 'defi_activity'
  },
  {
    id: 'q12',
    question: '🚀 What was the first NFT collection that Punk6529 called "the future of the metaverse"?',
    options: ['A) CryptoPunks', 'B) Art Blocks', 'C) The Memes by 6529', 'D) Bored Apes'],
    correctAnswer: 'C',
    hint1: 'This is their own NFT project',
    hint2: 'Focused on open metaverse principles',
    hint3: 'Features meme-based artwork with meaning',
    points: 200,
    timeLimit: 30,
    difficulty: 'hard',
    category: 'nft_collecting'
  },
  {
    id: 'q13',
    question: '⚖️ Which whale lost the most money in the Terra Luna collapse of 2022?',
    options: ['A) Do Kwon himself', 'B) Terraform Labs', 'C) Galaxy Digital', 'D) Three Arrows Capital'],
    correctAnswer: 'D',
    hint1: 'This was a major crypto hedge fund',
    hint2: 'They had billions invested in LUNA',
    hint3: 'Led to their complete bankruptcy',
    points: 200,
    timeLimit: 30,
    difficulty: 'hard',
    category: 'crypto_events'
  },
  {
    id: 'q14',
    question: '🎯 What trading strategy made "GCR" (gigachad_crypto_trader) famous?',
    options: ['A) Perp trading', 'B) Arbitrage', 'C) Long-term holding', 'D) NFT flipping'],
    correctAnswer: 'A',
    hint1: 'They specialize in derivatives trading',
    hint2: 'Known for massive leverage positions',
    hint3: 'Often posts trading philosophy on Twitter',
    points: 200,
    timeLimit: 30,
    difficulty: 'hard',
    category: 'trading_history'
  },
  {
    id: 'q15',
    question: '🎪 Which whale created the largest single NFT purchase in history (over $69M)?',
    options: ['A) Beeple himself', 'B) Metakovan', 'C) Pablo Rodriguez-Fraile', 'D) Tim Draper'],
    correctAnswer: 'B',
    hint1: 'This was for Beeple\'s "Everydays" artwork',
    hint2: 'Purchased at Christie\'s auction house',
    hint3: 'The buyer is a crypto investor from Singapore',
    points: 200,
    timeLimit: 30,
    difficulty: 'hard',
    category: 'nft_collecting'
  }
];

// Helper functions
export function getRandomQuestions(count: number = 5): MCQQuestion[] {
  const shuffled = [...WHALE_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): MCQQuestion[] {
  return WHALE_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByCategory(category: string): MCQQuestion[] {
  return WHALE_QUESTIONS.filter(q => q.category === category);
}

export function getProgressiveQuestions(): MCQQuestion[] {
  const easy = getQuestionsByDifficulty('easy').slice(0, 2);
  const medium = getQuestionsByDifficulty('medium').slice(0, 2);
  const hard = getQuestionsByDifficulty('hard').slice(0, 1);
  return [...easy, ...medium, ...hard];
} 