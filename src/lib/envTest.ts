// =============================================================================
// 🐋 ENVIRONMENT VARIABLES TEST & VALIDATION
// =============================================================================

interface EnvTestResult {
  name: string;
  value: string | undefined;
  isValid: boolean;
  type: 'required' | 'optional';
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface EnvTestSuite {
  blockchain: EnvTestResult[];
  websockets: EnvTestResult[];
  rpc: EnvTestResult[];
  wallet: EnvTestResult[];
  xmtp: EnvTestResult[];
  telegram: EnvTestResult[];
  game: EnvTestResult[];
}

class EnvironmentTester {
  private results: EnvTestSuite = {
    blockchain: [],
    websockets: [],
    rpc: [],
    wallet: [],
    xmtp: [],
    telegram: [],
    game: []
  };

  // Test blockchain API keys
  private testBlockchainAPIs(): void {
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    this.results.blockchain.push({
      name: 'ALCHEMY_API_KEY',
      value: alchemyKey ? `${alchemyKey.slice(0, 10)}...` : undefined,
      isValid: !!alchemyKey && alchemyKey.length > 20,
      type: 'required',
      status: !!alchemyKey && alchemyKey.length > 20 ? 'pass' : 'fail',
      message: !!alchemyKey ? 'Valid Alchemy API key detected' : 'Missing or invalid Alchemy API key'
    });

    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    this.results.blockchain.push({
      name: 'ETHERSCAN_API_KEY',
      value: etherscanKey ? `${etherscanKey.slice(0, 10)}...` : undefined,
      isValid: !!etherscanKey && etherscanKey.length > 20,
      type: 'required',
      status: !!etherscanKey && etherscanKey.length > 20 ? 'pass' : 'fail',
      message: !!etherscanKey ? 'Valid Etherscan API key detected' : 'Missing or invalid Etherscan API key'
    });

    const openSeaKey = process.env.OPENSEA_API_KEY;
    this.results.blockchain.push({
      name: 'OPENSEA_API_KEY',
      value: openSeaKey ? `${openSeaKey.slice(0, 10)}...` : undefined,
      isValid: !!openSeaKey && openSeaKey.length > 20,
      type: 'optional',
      status: !!openSeaKey && openSeaKey.length > 20 ? 'pass' : 'warning',
      message: !!openSeaKey ? 'Valid OpenSea API key detected' : 'OpenSea API key missing (optional)'
    });

    const coinGeckoKey = process.env.COINGECKO_API_KEY;
    this.results.blockchain.push({
      name: 'COINGECKO_API_KEY',
      value: coinGeckoKey ? `${coinGeckoKey.slice(0, 10)}...` : undefined,
      isValid: !!coinGeckoKey && coinGeckoKey.length > 10,
      type: 'optional',
      status: !!coinGeckoKey && coinGeckoKey.length > 10 ? 'pass' : 'warning',
      message: !!coinGeckoKey ? 'Valid CoinGecko API key detected' : 'CoinGecko API key missing (optional)'
    });
  }

  // Test WebSocket URLs
  private testWebSocketURLs(): void {
    const ethWs = process.env.ETH_WEBSOCKET_URL;
    this.results.websockets.push({
      name: 'ETH_WEBSOCKET_URL',
      value: ethWs ? `${ethWs.slice(0, 30)}...` : undefined,
      isValid: !!ethWs && ethWs.startsWith('wss://'),
      type: 'required',
      status: !!ethWs && ethWs.startsWith('wss://') ? 'pass' : 'fail',
      message: !!ethWs ? 'Valid Ethereum WebSocket URL' : 'Missing Ethereum WebSocket URL'
    });

    const baseWs = process.env.BASE_WEBSOCKET_URL;
    this.results.websockets.push({
      name: 'BASE_WEBSOCKET_URL',
      value: baseWs ? `${baseWs.slice(0, 30)}...` : undefined,
      isValid: !!baseWs && baseWs.startsWith('wss://'),
      type: 'optional',
      status: !!baseWs && baseWs.startsWith('wss://') ? 'pass' : 'warning',
      message: !!baseWs ? 'Valid Base WebSocket URL' : 'Missing Base WebSocket URL (optional)'
    });
  }

  // Test RPC endpoints
  private testRPCEndpoints(): void {
    const ethRpc = process.env.ETHEREUM_RPC_URL;
    this.results.rpc.push({
      name: 'ETHEREUM_RPC_URL',
      value: ethRpc ? `${ethRpc.slice(0, 30)}...` : undefined,
      isValid: !!ethRpc && ethRpc.startsWith('https://'),
      type: 'required',
      status: !!ethRpc && ethRpc.startsWith('https://') ? 'pass' : 'fail',
      message: !!ethRpc ? 'Valid Ethereum RPC URL' : 'Missing Ethereum RPC URL'
    });

    const baseRpc = process.env.BASE_RPC_URL;
    this.results.rpc.push({
      name: 'BASE_RPC_URL',
      value: baseRpc ? `${baseRpc.slice(0, 30)}...` : undefined,
      isValid: !!baseRpc && baseRpc.startsWith('https://'),
      type: 'optional',
      status: !!baseRpc && baseRpc.startsWith('https://') ? 'pass' : 'warning',
      message: !!baseRpc ? 'Valid Base RPC URL' : 'Missing Base RPC URL (optional)'
    });

    const polygonRpc = process.env.POLYGON_RPC_URL;
    this.results.rpc.push({
      name: 'POLYGON_RPC_URL',
      value: polygonRpc ? `${polygonRpc.slice(0, 30)}...` : undefined,
      isValid: !!polygonRpc && polygonRpc.startsWith('https://'),
      type: 'optional',
      status: !!polygonRpc && polygonRpc.startsWith('https://') ? 'pass' : 'warning',
      message: !!polygonRpc ? 'Valid Polygon RPC URL' : 'Missing Polygon RPC URL (optional)'
    });
  }

  // Test wallet connection
  private testWalletConfig(): void {
    const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    this.results.wallet.push({
      name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      value: walletConnectId ? `${walletConnectId.slice(0, 15)}...` : undefined,
      isValid: !!walletConnectId && walletConnectId.length > 20,
      type: 'required',
      status: !!walletConnectId && walletConnectId.length > 20 ? 'pass' : 'fail',
      message: !!walletConnectId ? 'Valid WalletConnect Project ID' : 'Missing WalletConnect Project ID'
    });

    const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS;
    this.results.wallet.push({
      name: 'NEXT_PUBLIC_ENABLE_TESTNETS',
      value: enableTestnets,
      isValid: enableTestnets === 'true' || enableTestnets === 'false',
      type: 'optional',
      status: enableTestnets === 'true' || enableTestnets === 'false' ? 'pass' : 'warning',
      message: 'Testnet configuration set'
    });
  }

  // Test XMTP configuration
  private testXMTPConfig(): void {
    const xmtpEnv = process.env.XMTP_ENV;
    this.results.xmtp.push({
      name: 'XMTP_ENV',
      value: xmtpEnv,
      isValid: xmtpEnv === 'dev' || xmtpEnv === 'production',
      type: 'required',
      status: xmtpEnv === 'dev' || xmtpEnv === 'production' ? 'pass' : 'fail',
      message: !!xmtpEnv ? 'Valid XMTP environment' : 'Missing XMTP environment'
    });

    const encryptionKey = process.env.ENCRYPTION_KEY;
    this.results.xmtp.push({
      name: 'ENCRYPTION_KEY',
      value: encryptionKey ? `${encryptionKey.slice(0, 10)}...` : undefined,
      isValid: !!encryptionKey && encryptionKey.length >= 32,
      type: 'required',
      status: !!encryptionKey && encryptionKey.length >= 32 ? 'pass' : 'fail',
      message: !!encryptionKey ? 'Valid encryption key detected' : 'Missing or invalid encryption key'
    });
  }

  // Test Telegram bot configuration
  private testTelegramConfig(): void {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.results.telegram.push({
      name: 'TELEGRAM_BOT_TOKEN',
      value: botToken ? `${botToken.slice(0, 15)}...` : undefined,
      isValid: !!botToken && botToken.includes(':'),
      type: 'optional',
      status: !!botToken && botToken.includes(':') ? 'pass' : 'warning',
      message: !!botToken ? 'Valid Telegram bot token' : 'Missing Telegram bot token (optional)'
    });

    const chatId = process.env.TELEGRAM_CHAT_ID;
    this.results.telegram.push({
      name: 'TELEGRAM_CHAT_ID',
      value: chatId,
      isValid: !!chatId && !isNaN(Number(chatId)),
      type: 'optional',
      status: !!chatId && !isNaN(Number(chatId)) ? 'pass' : 'warning',
      message: !!chatId ? 'Valid Telegram chat ID' : 'Missing Telegram chat ID (optional)'
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    this.results.telegram.push({
      name: 'TELEGRAM_BOT_USERNAME',
      value: botUsername,
      isValid: !!botUsername,
      type: 'optional',
      status: !!botUsername ? 'pass' : 'warning',
      message: !!botUsername ? 'Telegram bot username set' : 'Missing Telegram bot username (optional)'
    });
  }

  // Test game configuration
  private testGameConfig(): void {
    const whaleThreshold = process.env.WHALE_ALERT_THRESHOLD;
    this.results.game.push({
      name: 'WHALE_ALERT_THRESHOLD',
      value: whaleThreshold,
      isValid: !!whaleThreshold && !isNaN(Number(whaleThreshold)),
      type: 'optional',
      status: !!whaleThreshold && !isNaN(Number(whaleThreshold)) ? 'pass' : 'warning',
      message: !!whaleThreshold ? `Whale alert threshold: $${Number(whaleThreshold).toLocaleString()}` : 'Using default whale threshold'
    });

    const gameTimeout = process.env.GAME_TIMEOUT;
    this.results.game.push({
      name: 'GAME_TIMEOUT',
      value: gameTimeout,
      isValid: !!gameTimeout && !isNaN(Number(gameTimeout)),
      type: 'optional',
      status: !!gameTimeout && !isNaN(Number(gameTimeout)) ? 'pass' : 'warning',
      message: !!gameTimeout ? `Game timeout: ${Number(gameTimeout) / 1000}s` : 'Using default game timeout'
    });

    const botName = process.env.BOT_NAME;
    this.results.game.push({
      name: 'BOT_NAME',
      value: botName,
      isValid: !!botName,
      type: 'optional',
      status: !!botName ? 'pass' : 'warning',
      message: !!botName ? `Bot name: ${botName}` : 'Using default bot name'
    });
  }

  // Run all tests
  public runTests(): EnvTestSuite {
    this.testBlockchainAPIs();
    this.testWebSocketURLs();
    this.testRPCEndpoints();
    this.testWalletConfig();
    this.testXMTPConfig();
    this.testTelegramConfig();
    this.testGameConfig();
    
    return this.results;
  }

  // Generate test report
  public generateReport(): string {
    const results = this.runTests();
    let report = '\n🐋 WHALE HUNTER - ENVIRONMENT TEST REPORT\n';
    report += '='.repeat(50) + '\n\n';

    // Count stats
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let warningTests = 0;

    Object.entries(results).forEach(([category, tests]) => {
      report += `📋 ${category.toUpperCase()} CONFIGURATION:\n`;
      report += '-'.repeat(30) + '\n';
      
      tests.forEach(test => {
        totalTests++;
        const statusIcon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
        const typeIcon = test.type === 'required' ? '🔴' : '🟡';
        
        report += `${statusIcon} ${typeIcon} ${test.name}\n`;
        report += `   Value: ${test.value || 'NOT SET'}\n`;
        report += `   Status: ${test.message}\n\n`;
        
        if (test.status === 'pass') passedTests++;
        else if (test.status === 'fail') failedTests++;
        else warningTests++;
      });
    });

    report += '📊 SUMMARY:\n';
    report += '-'.repeat(20) + '\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `✅ Passed: ${passedTests}\n`;
    report += `❌ Failed: ${failedTests}\n`;
    report += `⚠️ Warnings: ${warningTests}\n\n`;

    if (failedTests > 0) {
      report += '🚨 CRITICAL ISSUES FOUND!\n';
      report += 'Please check your .env.local file and add missing required variables.\n\n';
    } else if (warningTests > 0) {
      report += '⚠️ Some optional features may not work without the missing variables.\n\n';
    } else {
      report += '🎉 All environment variables are properly configured!\n\n';
    }

    return report;
  }

  // Get quick status
  public getQuickStatus(): { status: 'good' | 'warning' | 'error'; message: string } {
    const results = this.runTests();
    let hasErrors = false;
    let hasWarnings = false;

    Object.values(results).forEach(tests => {
      tests.forEach(test => {
        if (test.status === 'fail' && test.type === 'required') hasErrors = true;
        if (test.status === 'warning' || (test.status === 'fail' && test.type === 'optional')) hasWarnings = true;
      });
    });

    if (hasErrors) {
      return { status: 'error', message: 'Critical environment variables missing!' };
    } else if (hasWarnings) {
      return { status: 'warning', message: 'Some optional features may not work properly.' };
    } else {
      return { status: 'good', message: 'All environment variables properly configured!' };
    }
  }
}

// Export singleton instance
export const envTester = new EnvironmentTester();

// Quick test function for development
export async function testEnvironment(): Promise<void> {
  console.log(envTester.generateReport());
}

// Runtime configuration object with fallbacks
export const runtimeConfig = {
  // Blockchain APIs
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY || '',
    isValid: !!(process.env.ALCHEMY_API_KEY && process.env.ALCHEMY_API_KEY.length > 20)
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
    isValid: !!(process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY.length > 20)
  },
  openSea: {
    apiKey: process.env.OPENSEA_API_KEY || '',
    isValid: !!(process.env.OPENSEA_API_KEY && process.env.OPENSEA_API_KEY.length > 20)
  },
  coinGecko: {
    apiKey: process.env.COINGECKO_API_KEY || '',
    isValid: !!(process.env.COINGECKO_API_KEY && process.env.COINGECKO_API_KEY.length > 10)
  },

  // Network URLs
  rpc: {
    ethereum: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    base: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
  },
  websocket: {
    ethereum: process.env.ETH_WEBSOCKET_URL || '',
    base: process.env.BASE_WEBSOCKET_URL || ''
  },

  // Wallet & Web3
  wallet: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    enableTestnets: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
  },

  // XMTP
  xmtp: {
    env: process.env.XMTP_ENV || 'dev',
    encryptionKey: process.env.ENCRYPTION_KEY || 'demo-key-for-development-only'
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    username: process.env.TELEGRAM_BOT_USERNAME || 'WhaleHunterBot'
  },

  // Game settings
  game: {
    whaleThreshold: Number(process.env.WHALE_ALERT_THRESHOLD) || 50000,
    timeout: Number(process.env.GAME_TIMEOUT) || 300000,
    botName: process.env.BOT_NAME || 'WhaleHunterBot'
  }
};

export default envTester; 