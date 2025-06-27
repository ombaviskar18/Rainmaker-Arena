interface RainmakerArenaConfig {
  // Core Configuration
  projectName: string;
  projectVersion: string;
  
  // 1. Coinbase CDP Wallet Integration
  cdp: {
    apiKeyName?: string;
    privateKey?: string;
    walletId?: string;
    projectId?: string;
  };
  
  // Multi-sig Configuration
  multisig: {
    walletAddress?: string;
    threshold: number;
    owners: string[];
  };
  
  // Community Reward Pool
  rewards: {
    poolAddress?: string;
    weeklyDistributionAmount: number;
    tokenContract?: string;
  };
  
  // 2. Telegram Bot Configuration
  telegram: {
    botToken?: string;
    chatId?: string;
    botUsername?: string;
  };
  
  // 3. Price Prediction Game Show
  gameShow: {
    roundsPerDay: number;
    minBet: number;
    maxBet: number;
    predictionWindow: number;
    bettingFeePercentage: number;
  };
  
  // Chainlink Price Feeds
  chainlink: {
    ethereumRpc?: string;
    priceFeeds: {
      btcUsd: string;
      ethUsd: string;
      linkUsd: string;
      maticUsd: string;
      uniUsd: string;
    };
  };
  
  // Blockchain Configuration
  blockchain: {
    ethereum: {
      rpcUrl?: string;
      privateKey?: string;
      chainId: number;
    };
    base: {
      rpcUrl?: string;
      privateKey?: string;
      chainId: number;
    };
    polygon: {
      rpcUrl?: string;
      privateKey?: string;
      chainId: number;
    };
  };
  
  // Database Configuration
  database: {
    url?: string;
    poolSize: number;
  };
  
  // Redis Configuration
  redis: {
    url?: string;
    password?: string;
  };
  
  // External APIs
  apis: {
    alchemy?: string;
    etherscan?: string;
    basescan?: string;
    polygonscan?: string;
    coingecko?: string;
    opensea?: string;
    news?: string;
  };
  
  // Security & Encryption
  security: {
    jwtSecret?: string;
    jwtExpiresIn: string;
    encryptionKey?: string;
    cryptoSecretKey?: string;
  };
  
  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // Game Configuration
  game: {
    correctAnswerPoints: number;
    streakBonusMultiplier: number;
    dailyBonusPoints: number;
    levelUpThreshold: number;
  };
  
  // XMTP Configuration
  xmtp: {
    env: string;
    encryptionKey?: string;
  };
  
  // Wallet Connection
  walletConnect: {
    projectId?: string;
  };
  
  // Development Configuration
  development: {
    isDevelopment: boolean;
    isProduction: boolean;
    debugMode: boolean;
    logLevel: string;
  };
  
  // Deployment Configuration
  deployment: {
    appUrl?: string;
    apiUrl?: string;
  };
}

class RainmakerEnvironmentManager {
  private config: RainmakerArenaConfig;

  constructor() {
    this.config = this.loadEnvironmentConfig();
  }

  private loadEnvironmentConfig(): RainmakerArenaConfig {
    return {
      // Core Configuration
      projectName: process.env.PROJECT_NAME || 'rainmaker_arena',
      projectVersion: process.env.PROJECT_VERSION || '1.0.0',
      
      // 1. Coinbase CDP Wallet Integration
      cdp: {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        privateKey: process.env.CDP_PRIVATE_KEY,
        walletId: process.env.CDP_WALLET_ID,
        projectId: process.env.CDP_PROJECT_ID,
      },
      
      // Multi-sig Configuration
      multisig: {
        walletAddress: process.env.MULTISIG_WALLET_ADDRESS,
        threshold: parseInt(process.env.MULTISIG_THRESHOLD || '2'),
        owners: (process.env.MULTISIG_OWNERS || '').split(',').filter(Boolean),
      },
      
      // Community Reward Pool
      rewards: {
        poolAddress: process.env.REWARD_POOL_ADDRESS,
        weeklyDistributionAmount: parseInt(process.env.WEEKLY_DISTRIBUTION_AMOUNT || '1000'),
        tokenContract: process.env.REWARD_TOKEN_CONTRACT,
      },
      
      // 2. Telegram Bot Configuration
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
        botUsername: process.env.TELEGRAM_BOT_USERNAME,
      },
      
      // 3. Price Prediction Game Show
      gameShow: {
        roundsPerDay: parseInt(process.env.GAME_SHOW_ROUNDS_PER_DAY || '4'),
        minBet: parseFloat(process.env.GAME_SHOW_MIN_BET || '0.01'),
        maxBet: parseFloat(process.env.GAME_SHOW_MAX_BET || '10'),
        predictionWindow: parseInt(process.env.GAME_SHOW_PREDICTION_WINDOW || '300000'),
        bettingFeePercentage: parseFloat(process.env.BETTING_FEE_PERCENTAGE || '2.5'),
      },
      
      // Chainlink Price Feeds
      chainlink: {
        ethereumRpc: process.env.CHAINLINK_ETHEREUM_MAINNET_RPC,
        priceFeeds: {
          btcUsd: process.env.CHAINLINK_PRICE_FEED_BTC_USD || '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
          ethUsd: process.env.CHAINLINK_PRICE_FEED_ETH_USD || '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
          linkUsd: process.env.CHAINLINK_PRICE_FEED_LINK_USD || '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
          maticUsd: process.env.CHAINLINK_PRICE_FEED_MATIC_USD || '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676',
          uniUsd: process.env.CHAINLINK_PRICE_FEED_UNI_USD || '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
        },
      },
      
      // Blockchain Configuration
      blockchain: {
        ethereum: {
          rpcUrl: process.env.ETHEREUM_RPC_URL,
          privateKey: process.env.ETHEREUM_PRIVATE_KEY,
          chainId: parseInt(process.env.ETHEREUM_CHAIN_ID || '1'),
        },
        base: {
          rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
          privateKey: process.env.BASE_PRIVATE_KEY,
          chainId: parseInt(process.env.BASE_CHAIN_ID || '8453'),
        },
        polygon: {
          rpcUrl: process.env.POLYGON_RPC_URL,
          privateKey: process.env.POLYGON_PRIVATE_KEY,
          chainId: parseInt(process.env.POLYGON_CHAIN_ID || '137'),
        },
      },
      
      // Database Configuration
      database: {
        url: process.env.DATABASE_URL,
        poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
      },
      
      // Redis Configuration
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
      },
      
      // External APIs
      apis: {
        alchemy: process.env.ALCHEMY_API_KEY,
        etherscan: process.env.ETHERSCAN_API_KEY,
        basescan: process.env.BASESCAN_API_KEY,
        polygonscan: process.env.POLYGONSCAN_API_KEY,
        coingecko: process.env.COINGECKO_API_KEY,
        opensea: process.env.OPENSEA_API_KEY,
        news: process.env.NEWS_API_KEY,
      },
      
      // Security & Encryption
      security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        encryptionKey: process.env.ENCRYPTION_KEY,
        cryptoSecretKey: process.env.CRYPTO_SECRET_KEY,
      },
      
      // Rate Limiting
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      },
      
      // Game Configuration
      game: {
        correctAnswerPoints: parseInt(process.env.CORRECT_ANSWER_POINTS || '100'),
        streakBonusMultiplier: parseFloat(process.env.STREAK_BONUS_MULTIPLIER || '1.5'),
        dailyBonusPoints: parseInt(process.env.DAILY_BONUS_POINTS || '500'),
        levelUpThreshold: parseInt(process.env.LEVEL_UP_THRESHOLD || '1000'),
      },
      
      // XMTP Configuration
      xmtp: {
        env: process.env.XMTP_ENV || 'production',
        encryptionKey: process.env.XMTP_ENCRYPTION_KEY,
      },
      
      // Wallet Connection
      walletConnect: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      },
      
      // Development Configuration
      development: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        debugMode: process.env.DEBUG_MODE === 'true',
        logLevel: process.env.LOG_LEVEL || 'info',
      },
      
      // Deployment Configuration
      deployment: {
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://rainmaker-arena.vercel.app',
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://rainmaker-arena.vercel.app/api',
      },
    };
  }

  public getConfig(): RainmakerArenaConfig {
    return this.config;
  }

  public getCDPConfig() {
    return this.config.cdp;
  }



  public getTelegramConfig() {
    return this.config.telegram;
  }

  public getGameShowConfig() {
    return this.config.gameShow;
  }

  public getChainlinkConfig() {
    return this.config.chainlink;
  }

  public getBlockchainConfig() {
    return this.config.blockchain;
  }

  public getDatabaseConfig() {
    return this.config.database;
  }

  public getRedisConfig() {
    return this.config.redis;
  }

  public getAPIConfig() {
    return this.config.apis;
  }

  public getSecurityConfig() {
    return this.config.security;
  }

  public getGameConfig() {
    return this.config.game;
  }

  public getXMTPConfig() {
    return this.config.xmtp;
  }

  public validateConfiguration(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check critical configurations
    if (!this.config.walletConnect.projectId) {
      errors.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for wallet connection');
    }

    if (!this.config.database.url) {
      errors.push('DATABASE_URL is required for user profiles and game data');
    }

    // Check CDP configuration
    if (!this.config.cdp.apiKeyName || !this.config.cdp.privateKey) {
      warnings.push('CDP wallet configuration incomplete - automated rewards disabled');
    }



    // Check Telegram configuration
    if (!this.config.telegram.botToken) {
      warnings.push('Telegram bot token missing - Telegram integration disabled');
    }

    // Check price feed configuration
    if (!this.config.chainlink.ethereumRpc) {
      warnings.push('Chainlink RPC URL missing - using public endpoints (may be slower)');
    }

    // Check optional but recommended configurations
    if (!this.config.apis.alchemy) {
      warnings.push('ALCHEMY_API_KEY not found - using public RPC endpoints (may be slower)');
    }

    if (!this.config.security.jwtSecret) {
      warnings.push('JWT_SECRET not found - using insecure default for development only');
    }

    if (!this.config.security.encryptionKey) {
      warnings.push('ENCRYPTION_KEY not found - using insecure default for development only');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public logConfiguration(): void {
    console.log('🚀 Rainmaker Arena Configuration:');
    console.log(`├── Environment: ${this.config.development.isDevelopment ? 'Development' : 'Production'}`);
    console.log(`├── Project: ${this.config.projectName} v${this.config.projectVersion}`);
    
    console.log('📊 Feature Status:');
    console.log(`├── CDP Wallet: ${this.config.cdp.apiKeyName ? '✅ Configured' : '❌ Missing'}`);

    console.log(`├── Telegram Bot: ${this.config.telegram.botToken ? '✅ Configured' : '❌ Missing'}`);
    console.log(`├── Database: ${this.config.database.url ? '✅ Configured' : '❌ Missing'}`);
    console.log(`├── Redis Cache: ${this.config.redis.url ? '✅ Configured' : '⚠️ Using default'}`);
    console.log(`├── Price Feeds: ${this.config.chainlink.ethereumRpc ? '✅ Configured' : '⚠️ Using public RPC'}`);
    console.log(`├── WalletConnect: ${this.config.walletConnect.projectId ? '✅ Configured' : '❌ Missing'}`);
    
    console.log('🎮 Game Configuration:');
    console.log(`├── Daily Rounds: ${this.config.gameShow.roundsPerDay}`);
    console.log(`├── Bet Range: $${this.config.gameShow.minBet} - $${this.config.gameShow.maxBet}`);
    console.log(`├── Prediction Window: ${this.config.gameShow.predictionWindow / 1000}s`);
    console.log(`└── Weekly Distribution: ${this.config.rewards.weeklyDistributionAmount} tokens`);
  }
}

// Export singleton instance
export const rainmakerEnv = new RainmakerEnvironmentManager();

// Export convenience functions
export const getConfig = () => rainmakerEnv.getConfig();
export const getCDPConfig = () => rainmakerEnv.getCDPConfig();

export const getTelegramConfig = () => rainmakerEnv.getTelegramConfig();
export const getGameShowConfig = () => rainmakerEnv.getGameShowConfig();
export const getChainlinkConfig = () => rainmakerEnv.getChainlinkConfig();
export const getBlockchainConfig = () => rainmakerEnv.getBlockchainConfig();
export const getDatabaseConfig = () => rainmakerEnv.getDatabaseConfig();
export const getRedisConfig = () => rainmakerEnv.getRedisConfig();
export const getAPIConfig = () => rainmakerEnv.getAPIConfig();
export const getSecurityConfig = () => rainmakerEnv.getSecurityConfig();
export const getGameConfig = () => rainmakerEnv.getGameConfig();
export const getXMTPConfig = () => rainmakerEnv.getXMTPConfig();
export const validateConfiguration = () => rainmakerEnv.validateConfiguration();
export const logConfiguration = () => rainmakerEnv.logConfiguration(); 