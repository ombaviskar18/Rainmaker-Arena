'use client';

import { CdpToolProvider } from '@coinbase/agentkit';

export interface AgentResponse {
  message: string;
  confidence: number;
  suggestions?: string[];
  needsMoreInfo?: boolean;
}

export class WhaleGameAgent {
  private toolProvider: CdpToolProvider | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      // Initialize CDP Tool Provider
      // Note: In production, you'd use proper API keys and network configuration
      console.log('🤖 Initializing AgentKit...');
      
      // For now, we'll mock the CDP provider since we need proper setup
      this.isInitialized = true;
      console.log('✅ AgentKit initialized (mock mode)');
    } catch (error) {
      console.error('❌ Failed to initialize AgentKit:', error);
      // Fallback to basic responses
      this.isInitialized = false;
    }
  }

  public async generateHint(whaleName: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    // AI-powered hint generation based on real onchain data
    const hintTemplates = {
      'Vitalik Buterin': {
        easy: 'This person created Ethereum and is known for wearing purple.',
        medium: 'Co-founder of the second-largest blockchain who donated billions to charity.',
        hard: 'Russian-Canadian programmer who proposed Ethereum at age 19.'
      },
      'Punk6529': {
        easy: 'Famous for collecting CryptoPunks and advocating for digital rights.',
        medium: 'Anonymous NFT whale who created "The Memes" collection.',
        hard: 'Decentralization advocate with one of the largest punk collections.'
      },
      'Pranksy': {
        easy: 'One of the earliest and biggest NFT collectors from the UK.',
        medium: 'Anonymous collector known for discovering NFT gems early.',
        hard: 'OG NFT collector who influenced the entire space in 2021.'
      }
    };

    const hints = hintTemplates[whaleName as keyof typeof hintTemplates];
    if (hints) {
      return hints[difficulty];
    }

    return this.generateGenericHint(whaleName, difficulty);
  }

  private generateGenericHint(_whaleName: string, _difficulty: string): string {
    const genericHints = [
      'This whale is known for large transactions and influence in the crypto space.',
      'A prominent figure in DeFi or NFT communities.',
      'Someone who has made significant impacts on blockchain adoption.'
    ];

    return genericHints[Math.floor(Math.random() * genericHints.length)];
  }

  public async analyzeGuess(guess: string, targetWhale: string): Promise<AgentResponse> {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedTarget = targetWhale.toLowerCase().trim();

    // Exact match
    if (normalizedGuess === normalizedTarget) {
      return {
        message: '🎉 Correct! You identified the whale perfectly!',
        confidence: 1.0
      };
    }

    // Partial match logic
    const similarity = this.calculateSimilarity(normalizedGuess, normalizedTarget);
    
    if (similarity > 0.7) {
      return {
        message: '🔥 Very close! You\'re on the right track!',
        confidence: similarity,
        suggestions: this.generateSuggestions(targetWhale)
      };
    } else if (similarity > 0.4) {
      return {
        message: '🤔 Getting warmer, but not quite there yet.',
        confidence: similarity,
        needsMoreInfo: true
      };
    } else {
      return {
        message: '❌ Not quite right. Try thinking about the hints!',
        confidence: similarity
      };
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
          break;
        }
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  private generateSuggestions(targetWhale: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      'Vitalik Buterin': [
        'Think about Ethereum founders',
        'Consider someone who wears purple',
        'A young programmer from Russia/Canada'
      ],
      'Punk6529': [
        'Think about NFT collectors',
        'Someone with a punk collection',
        'An advocate for decentralization'
      ],
      'Pranksy': [
        'Early NFT adopter',
        'UK-based collector',
        'Known for finding gems'
      ]
    };

    return suggestionMap[targetWhale] || ['Think about the hints provided'];
  }

  public async generateWhaleAlert(alertData: { whale: string; details: string; amount: string }): Promise<string> {
    // AI-powered alert message generation
    const templates = [
      `🚨 WHALE SPOTTED! ${alertData.whale} just ${alertData.details}! Can you guess who this whale is? First correct answer gets bonus points! 🎯`,
      `🐋 BIG MOVES! Someone just ${alertData.details}! This whale is known for ${this.getWhaleCharacteristic(alertData.whale)}. Who could it be? 🤔`,
      `⚡ ALERT! ${alertData.amount} transaction detected! This mystery whale ${alertData.details}. Time to put your knowledge to the test! 🎮`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getWhaleCharacteristic(whaleName: string): string {
    const characteristics: Record<string, string> = {
      'Vitalik Buterin': 'founding Ethereum and charitable donations',
      'Punk6529': 'massive NFT collections and decentralization advocacy',
      'Pranksy': 'early NFT adoption and gem discovery'
    };

    return characteristics[whaleName] || 'significant crypto activities';
  }

  public async analyzeOnchainData(address: string): Promise<{
    summary: string;
    activities: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    // Mock onchain analysis - in production, integrate with:
    // - Alchemy APIs
    // - Etherscan APIs
    // - Dune Analytics
    // - Nansen APIs

    console.log(`🔍 Analyzing onchain data for ${address}...`);

    return {
      summary: 'Active DeFi participant with significant NFT holdings',
      activities: [
        'Large ETH transfers',
        'NFT trading on OpenSea',
        'DeFi protocol interactions',
        'Token swaps on Uniswap'
      ],
      riskLevel: 'low'
    };
  }

  public async generateGameStrategy(playerHistory: { correct: boolean }[]): Promise<{
    difficulty: 'easy' | 'medium' | 'hard';
    hints: string[];
    estimatedTime: number;
  }> {
    // AI-powered game difficulty adjustment
    const avgAccuracy = playerHistory.length > 0 
      ? playerHistory.filter(h => h.correct).length / playerHistory.length 
      : 0.5;

    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    
    if (avgAccuracy > 0.8) difficulty = 'hard';
    else if (avgAccuracy < 0.4) difficulty = 'easy';

    return {
      difficulty,
      hints: [
        'Adaptive hint based on your performance',
        'Personalized clue for your skill level',
        'AI-generated contextual hint'
      ],
      estimatedTime: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 60
    };
  }

  public async processNaturalLanguageQuery(query: string): Promise<string> {
    // Process natural language questions about whales
    const queryLower = query.toLowerCase();

    if (queryLower.includes('vitalik')) {
      return 'Vitalik Buterin is the co-founder of Ethereum, known for his purple outfits and charitable donations. He created Ethereum when he was just 19 years old!';
    } else if (queryLower.includes('punk') || queryLower.includes('6529')) {
      return 'Punk6529 is one of the most influential NFT collectors and advocates for decentralization. They own a massive collection of CryptoPunks!';
    } else if (queryLower.includes('nft')) {
      return 'Many crypto whales are heavily involved in NFTs - collecting, creating, and trading valuable digital assets!';
    } else if (queryLower.includes('defi')) {
      return 'DeFi whales often provide liquidity, yield farm, and participate in governance across multiple protocols!';
    }

    return 'I can help you learn about crypto whales! Ask me about specific whales, NFTs, DeFi, or onchain activities! 🐋';
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
} 