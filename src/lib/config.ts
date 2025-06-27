export const gameConfig = {
  // XMTP Configuration
  xmtp: {
    env: 'dev' as const, // 'dev' | 'production'
    network: 'testnet',
  },

  // AgentKit Configuration
  agentKit: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  },

  // Base Network Configuration
  base: {
    network: 'base-sepolia', // testnet
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532,
  },

  // Game Settings
  game: {
    defaultTimeLimit: 60, // seconds
    maxHints: 3,
    maxRounds: 10,
    pointsPerCorrect: 100,
    streakMultiplier: 1.5,
    hintPenalty: 15,
  },

  // Whale Detection
  whaleDetection: {
    minValueUSD: 100000, // $100k minimum
    alertInterval: 120000, // 2 minutes
    monitorNFTs: true,
    monitorDeFi: true,
    monitorTransfers: true,
  },

  // API Endpoints (for future integration)
  apis: {
    etherscan: 'https://api.etherscan.io/api',
    alchemy: '', // Add your Alchemy API key
    moralis: '', // Add your Moralis API key
    quicknode: '', // Add your QuickNode API key
    opensea: 'https://api.opensea.io/api/v2',
    coingecko: 'https://api.coingecko.com/api/v3',
  },

  // Feature Flags
  features: {
    xmtpEnabled: true,
    whaleAlertsEnabled: true,
    agentKitEnabled: true,
    onchainRewards: false, // Coming in Phase 3
    miniApp: false, // Coming in Phase 4
  },
} as const;

export type GameConfig = typeof gameConfig; 