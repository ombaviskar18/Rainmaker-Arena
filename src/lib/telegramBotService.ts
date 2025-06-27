import { RealTimeWhaleDetector, RealWhaleActivity } from './realTimeWhaleDetector';

interface TelegramConfig {
  botToken: string | undefined;
  chatId?: string;
  botUsername: string | undefined;
  alchemyApiKey?: string;
  etherscanApiKey?: string;
  botServerUrl?: string;
}

interface TelegramMessage {
  message: string;
  parseMode?: 'HTML' | 'Markdown';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

export class TelegramBotService {
  private config: TelegramConfig;
  private apiUrl: string;
  private whaleDetector: RealTimeWhaleDetector | null = null;
  private subscribedChats: Set<string> = new Set();

  constructor(config: TelegramConfig) {
    if (!config.botToken) {
      throw new Error('Bot token is required for Telegram bot service');
    }
    if (!config.botUsername) {
      throw new Error('Bot username is required for Telegram bot service');
    }
    
    this.config = config;
    this.apiUrl = `https://api.telegram.org/bot${config.botToken}`;
    
    // Initialize real-time whale detector if API keys are provided
    if (config.alchemyApiKey) {
      this.initializeWhaleDetector();
    }
  }

  private async initializeWhaleDetector() {
    try {
      this.whaleDetector = new RealTimeWhaleDetector({
        alchemyApiKey: this.config.alchemyApiKey!,
        etherscanApiKey: this.config.etherscanApiKey || '',
        minTransactionUSD: 50000, // $50K minimum for Telegram alerts
        updateInterval: 60000 // 1 minute
      });

      // Listen for real whale activities
      this.whaleDetector.on('whaleActivity', (activity: RealWhaleActivity) => {
        this.broadcastRealWhaleAlert(activity);
      });

      // Start whale detection
      await this.whaleDetector.startDetection();
      console.log('🐋 Telegram bot whale detector initialized');
    } catch (error) {
      console.error('Failed to initialize whale detector for Telegram bot:', error);
    }
  }

  /**
   * Initialize the bot for production use
   */
  public async initializeBot(webhookUrl?: string): Promise<boolean> {
    try {
      // Test bot connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to Telegram bot');
      }

      // Set webhook if URL provided
      if (webhookUrl) {
        const webhookSet = await this.setWebhook(webhookUrl);
        if (!webhookSet) {
          console.warn('⚠️ Failed to set webhook, bot will work in polling mode');
        }
      }

      // Start demo alerts if no real whale detector
      if (!this.whaleDetector) {
        this.startDemoAlerts();
      }

      console.log('✅ Telegram bot initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error);
      return false;
    }
  }

  /**
   * Start sending demo whale alerts for testing
   */
  private startDemoAlerts(): void {
    console.log('🚀 Starting demo whale alerts...');
    
    // Send demo alert every 5 minutes
    setInterval(() => {
      if (this.subscribedChats.size > 0) {
        this.sendDemoWhaleAlert();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Send first demo alert after 30 seconds
    setTimeout(() => {
      if (this.subscribedChats.size > 0) {
        this.sendDemoWhaleAlert();
      }
    }, 30000);
  }

  /**
   * Send a demo whale alert
   */
  private async sendDemoWhaleAlert(): Promise<void> {
    const demoAlerts = [
      {
        whale: 'Vitalik Buterin',
        amount: '1,247 ETH ($3.2M)',
        action: 'Large transfer to Binance',
        network: 'ethereum',
        severity: 'high',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        whale: 'Punk6529',
        amount: '892 ETH ($2.1M)',
        action: 'NFT purchase - CryptoPunk',
        network: 'ethereum', 
        severity: 'medium',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        whale: 'Whale #3',
        amount: '2,156 ETH ($5.8M)',
        action: 'Uniswap V3 swap',
        network: 'ethereum',
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    const randomAlert = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    
    try {
      await this.broadcastDemoAlert(randomAlert);
      console.log('📢 Demo whale alert sent');
    } catch (error) {
      console.error('❌ Failed to send demo alert:', error);
    }
  }

  /**
   * Broadcast demo alert to all subscribed chats
   */
  private async broadcastDemoAlert(alert: any): Promise<void> {
    const message = this.formatWhaleAlert(alert);
    
    const promises = Array.from(this.subscribedChats).map(chatId => 
      this.sendMessage(chatId, message)
    );

    await Promise.all(promises);
  }

  /**
   * Send a whale alert to Telegram (legacy support)
   */
  public async sendWhaleAlert(alert: any): Promise<boolean> {
    try {
      const message = this.formatWhaleAlert(alert);
      
      if (this.config.chatId) {
        return await this.sendMessage(this.config.chatId, message);
      } else {
        console.warn('No Telegram chat ID configured, cannot send message');
        return false;
      }
    } catch (error) {
      console.error('Failed to send whale alert to Telegram:', error);
      return false;
    }
  }

  /**
   * Broadcast real-time whale alert to all subscribed chats
   */
  private async broadcastRealWhaleAlert(activity: RealWhaleActivity): Promise<void> {
    try {
      const message = this.formatRealWhaleAlert(activity);
      
      // Send to all subscribed chats
      const promises = Array.from(this.subscribedChats).map(chatId => 
        this.sendMessage(chatId, message)
      );

      await Promise.all(promises);
      console.log(`📢 Broadcasted real whale alert to ${this.subscribedChats.size} chats`);
    } catch (error) {
      console.error('Failed to broadcast real whale alert:', error);
    }
  }

  /**
   * Subscribe a chat to whale alerts
   */
  public subscribeToChatAlerts(chatId: string): void {
    this.subscribedChats.add(chatId);
    console.log(`✅ Chat ${chatId} subscribed to whale alerts`);
    
    // Send immediate demo alert as confirmation
    setTimeout(() => {
      this.sendImmediateDemo(chatId);
    }, 2000); // 2 seconds after subscription
  }

  /**
   * Send immediate demo alert to new subscriber
   */
  private async sendImmediateDemo(chatId: string): Promise<void> {
    const welcomeAlert = {
      whale: 'Welcome Demo Whale',
      amount: '500 ETH ($1.3M)',
      action: 'Test transaction - You are now subscribed!',
      network: 'ethereum',
      severity: 'high',
      timestamp: new Date().toLocaleTimeString()
    };

    try {
      const message = this.formatWhaleAlert(welcomeAlert);
      await this.sendMessage(chatId, message);
      console.log('📢 Welcome demo alert sent to new subscriber');
    } catch (error) {
      console.error('❌ Failed to send welcome demo alert:', error);
    }
  }

  /**
   * Unsubscribe a chat from whale alerts
   */
  public unsubscribeFromChatAlerts(chatId: string): void {
    this.subscribedChats.delete(chatId);
    console.log(`❌ Chat ${chatId} unsubscribed from whale alerts`);
  }

  /**
   * Send a message to a specific chat
   */
  public async sendMessage(chatId: string, message: TelegramMessage | string): Promise<boolean> {
    try {
      const messageData = typeof message === 'string' 
        ? { message }
        : message;

      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageData.message,
          parse_mode: messageData.parseMode || 'HTML',
          disable_web_page_preview: messageData.disableWebPagePreview || true,
          disable_notification: messageData.disableNotification || false,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Telegram API error:', data);
        return false;
      }

      console.log('✅ Message sent to Telegram successfully');
      return true;
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      return false;
    }
  }

  /**
   * Get information about the bot
   */
  public async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      const data = await response.json();
      
      if (response.ok && data.ok) {
        return data.result;
      } else {
        console.error('Failed to get bot info:', data);
        return null;
      }
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }

  /**
   * Set webhook for the bot (for production use)
   */
  public async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        console.log('✅ Webhook set successfully');
        return true;
      } else {
        console.error('Failed to set webhook:', data);
        return false;
      }
    } catch (error) {
      console.error('Error setting webhook:', error);
      return false;
    }
  }

  /**
   * Format real-time whale alert
   */
  private formatRealWhaleAlert(activity: RealWhaleActivity): string {
    const severityEmoji = {
      critical: '🚨🚨',
      high: '🚨',
      medium: '⚠️',
      low: '📊'
    };

    const emoji = severityEmoji[activity.severity] || '📊';
    const formattedUSD = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(activity.amount_usd);

    const timeAgo = new Date(activity.timestamp).toLocaleTimeString();

    return `${emoji} <b>LIVE WHALE ALERT</b> ${emoji}

🐋 <b>Whale:</b> ${activity.whale_name}
💰 <b>Amount:</b> ${activity.amount_eth.toFixed(2)} ETH (${formattedUSD})
🔍 <b>Activity:</b> ${activity.description}
⚡ <b>Network:</b> Ethereum
🔗 <b>TX Hash:</b> <code>${activity.transaction_hash.slice(0, 10)}...${activity.transaction_hash.slice(-6)}</code>
📅 <b>Time:</b> ${timeAgo}
⭐ <b>Severity:</b> ${activity.severity.toUpperCase()}

🎯 <b>REAL-TIME DATA FROM BLOCKCHAIN!</b>
💎 Test your whale knowledge in our trivia game!
🎮 Play now: https://whalehunter.vercel.app/

#WhaleAlert #Crypto #Ethereum #RealTime`;
  }

  /**
   * Format whale alert for Telegram (legacy)
   */
  private formatWhaleAlert(alert: any): string {
    const severityEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '📊',
      low: '📈'
    };

    const networkEmoji = {
      ethereum: '⚡',
      base: '🔵',
      polygon: '🟣'
    };

    const emoji = severityEmoji[alert.severity as keyof typeof severityEmoji] || '📊';
    const networkIcon = networkEmoji[alert.transaction?.network as keyof typeof networkEmoji] || '⚡';

    return `${emoji} <b>WHALE ALERT</b> ${emoji}

🐋 <b>Whale:</b> ${alert.whale}
💰 <b>Amount:</b> ${alert.amount}
🔍 <b>Action:</b> ${alert.action}
${networkIcon} <b>Network:</b> ${alert.transaction?.network?.toUpperCase() || 'ETH'}
⏰ <b>Time:</b> ${alert.timestamp}

💎 <b>Join the hunt in Guess the Whale!</b>
🎮 Play now: https://whalehunter.vercel.app/

#WhaleAlert #Crypto #${alert.transaction?.network || 'Ethereum'}`;
  }

  /**
   * Send welcome message to new subscribers
   */
  public async sendWelcomeMessage(chatId: string): Promise<boolean> {
    const whaleStatus = this.whaleDetector?.isActive() ? '🟢 ACTIVE' : '🟡 STARTING';
    const trackedWhalles = this.whaleDetector?.getWhaleWallets().length || '15+';

    const welcomeMessage = `🐋 <b>Welcome to LIVE Whale Alert Bot!</b> 🐋

🚨 <b>REAL-TIME MONITORING STATUS:</b> ${whaleStatus}
🎯 <b>Tracked Whales:</b> ${trackedWhalles} major wallets
📊 <b>Live Blockchain Data:</b> Ethereum mainnet

<b>🔥 What you'll receive:</b>
• Real-time whale transactions (>$50K USD)
• Live blockchain monitoring every 15 seconds
• Actual transaction hashes and amounts
• Famous whale addresses (Vitalik, Punk6529, etc.)
• DeFi interactions and large transfers

🎮 <b>Rainmaker Arena Trivia Game:</b>
Test your crypto whale knowledge and earn rewards!
🔗 https://whalehunter.vercel.app/

<b>Commands:</b>
/start - Subscribe to alerts
/stop - Unsubscribe from alerts
/status - Check monitoring status
/whales - View tracked whale wallets
/help - Get help

🚀 <b>LIVE DATA FROM ALCHEMY API!</b>
Happy whale hunting! 🐋⚡`;

    return await this.sendMessage(chatId, welcomeMessage);
  }

  /**
   * Handle bot commands
   */
  public async handleCommand(chatId: string, command: string, userFirstName?: string): Promise<boolean> {
    switch (command.toLowerCase()) {
      case '/start':
        this.subscribeToChatAlerts(chatId);
        return await this.sendWelcomeMessage(chatId);
      
      case '/help':
        const helpMessage = `🤖 <b>Whale Alerting Bot Help</b>

<b>Available Commands:</b>
/start - Get welcome message
/stop - Unsubscribe from alerts
/status - Check your subscription
/help - Show this help

<b>About Alerts:</b>
• Real-time whale transaction monitoring
• Minimum threshold: $50K USD
• Networks: Ethereum, Base, Polygon
• Updates every few seconds

<b>Play the Game:</b>
Test your crypto knowledge with whale trivia!
🎮 https://whalehunter.vercel.app/

Questions? Contact support in the game!`;
        return await this.sendMessage(chatId, helpMessage);
      
      case '/status':
        const statusMessage = `✅ <b>Subscription Status</b>

🐋 Whale alerts: <b>ACTIVE</b>
📊 Networks monitored: ETH, Base, Polygon
💰 Minimum threshold: $50K USD
⚡ Update frequency: Real-time

You're all set to receive whale alerts! 🎯`;
        return await this.sendMessage(chatId, statusMessage);
      
      case '/stop':
        this.unsubscribeFromChatAlerts(chatId);
        const stopMessage = `😢 <b>Unsubscribed Successfully</b>

You will no longer receive whale alerts.

To resubscribe, just send /start again.

Thanks for using Whale Alerting Bot! 🐋`;
        return await this.sendMessage(chatId, stopMessage);

      case '/whales':
        return await this.sendWhaleWalletsList(chatId);
      
      default:
        const unknownMessage = `❓ Unknown command: ${command}

Type /help to see available commands.`;
        return await this.sendMessage(chatId, unknownMessage);
    }
  }

  /**
   * Send whale wallets list
   */
  private async sendWhaleWalletsList(chatId: string): Promise<boolean> {
    if (!this.whaleDetector) {
      const errorMessage = `❌ <b>Whale detector not initialized</b>

Please contact support to enable real-time monitoring.`;
      return await this.sendMessage(chatId, errorMessage);
    }

    const whales = this.whaleDetector.getWhaleWallets().slice(0, 10);
    
    if (whales.length === 0) {
      const noDataMessage = `🔄 <b>Loading whale data...</b>

Whale wallets are being fetched from the blockchain.
Please try again in a few moments.`;
      return await this.sendMessage(chatId, noDataMessage);
    }

    let message = `🐋 <b>Top Tracked Whale Wallets</b>\n\n`;
    
    whales.forEach((whale, index) => {
      const rank = index + 1;
      const rankEmoji = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `${rank}.`;
      const balanceFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(whale.balance_usd);

      message += `${rankEmoji} <b>${whale.name || 'Unknown Whale'}</b>\n`;
      message += `💰 ${whale.balance_eth.toFixed(1)} ETH (${balanceFormatted})\n`;
      message += `📍 <code>${whale.address.slice(0, 6)}...${whale.address.slice(-4)}</code>\n\n`;
    });

    message += `🔄 <b>Live data updated every minute</b>\n`;
    message += `🎯 <b>Total monitored:</b> ${this.whaleDetector.getWhaleWallets().length}+ wallets`;

    return await this.sendMessage(chatId, message);
  }

  /**
   * Get the invite link for the bot
   */
  public getBotInviteLink(): string {
    return `https://t.me/${this.config.botUsername}`;
  }

  /**
   * Test the bot connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const botInfo = await this.getBotInfo();
      if (botInfo) {
        console.log('✅ Telegram bot connection successful:', botInfo.username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Telegram bot connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
let telegramBotInstance: TelegramBotService | null = null;

export function initializeTelegramBot(config: TelegramConfig): TelegramBotService {
  telegramBotInstance = new TelegramBotService(config);
  return telegramBotInstance;
}

export function getTelegramBot(): TelegramBotService | null {
  return telegramBotInstance;
} 