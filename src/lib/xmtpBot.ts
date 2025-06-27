'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { generateUniqueId } from './utils';

export interface XMTPMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'player' | 'bot' | 'system' | 'whale_alert';
}

export interface GameRoom {
  id: string;
  name: string;
  conversation: Conversation;
  players: string[];
  isActive: boolean;
  currentWhale?: string;
  gameState: 'waiting' | 'playing' | 'ended';
}

export class WhaleHunterBot {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private gameRooms: Map<string, GameRoom> = new Map();
  private messageCallbacks: ((message: XMTPMessage) => void)[] = [];
  private whaleAlertCallbacks: ((alert: { type: string; amount: string; whale: string; details: string }) => void)[] = [];

  constructor() {
    this.initializeBot();
  }

  private async initializeBot() {
    try {
      // Generate a random wallet for the bot
      this.wallet = Wallet.createRandom();
      console.log('🤖 Bot wallet address:', this.wallet.address);
      
      // Initialize XMTP client in dev environment
      this.client = await Client.create(this.wallet, { 
        env: 'dev'
      });
      
      console.log('✅ XMTP Bot initialized successfully!');
      this.startListening();
    } catch (error) {
      console.error('❌ Failed to initialize XMTP Bot:', error);
    }
  }

  private async startListening() {
    if (!this.client) return;

    try {
      const stream = await this.client.conversations.stream();
      
      for await (const conversation of stream) {
        console.log('📩 New conversation:', conversation.peerAddress);
        this.handleNewConversation(conversation);
      }
    } catch (error) {
      console.error('Error starting listener:', error);
    }
  }

  private async handleNewConversation(conversation: Conversation) {
    try {
      const messages = await conversation.streamMessages();
      
      for await (const message of messages) {
        if (message.senderAddress === this.client?.address) continue;
        
        const xmtpMessage: XMTPMessage = {
          id: generateUniqueId(),
          content: message.content,
          sender: message.senderAddress,
          timestamp: message.sent,
          type: 'player'
        };

        this.handleIncomingMessage(xmtpMessage, conversation);
      }
    } catch (error) {
      console.error('Error handling conversation:', error);
    }
  }

  private async handleIncomingMessage(message: XMTPMessage, conversation: Conversation) {
    console.log('📨 Received message:', message.content, 'from:', message.sender);

    this.messageCallbacks.forEach(callback => callback(message));
    await this.processGameCommand(message, conversation);
  }

  private async processGameCommand(message: XMTPMessage, conversation: Conversation) {
    const content = message.content.toLowerCase().trim();

    try {
      if (content === '/start' || content === 'start game') {
        await this.startNewGame(conversation, message.sender);
      } else if (content === '/help') {
        await this.showHelp(conversation);
      } else if (content.startsWith('/guess ')) {
        const guess = content.replace('/guess ', '');
        await this.processGuess(conversation, message.sender, guess);
      } else {
        await this.processGuess(conversation, message.sender, message.content);
      }
    } catch (error) {
      console.error('Error processing command:', error);
    }
  }

  private async startNewGame(conversation: Conversation, playerAddress: string) {
    const welcomeMessage = `🌊 **RAINMAKER ARENA STARTED!** 🌊

🎮 Ready to hunt crypto whales?
🎯 I'll give you hints, you guess the whale!

Commands:
• Just type the whale's name to guess
• /help - Show help menu

Let's begin! 🚀`;

    await this.sendMessage(conversation, welcomeMessage);
  }

  private async processGuess(conversation: Conversation, playerAddress: string, guess: string) {
    await this.sendMessage(conversation, `🎯 You guessed: "${guess}" - Game logic coming soon!`);
  }

  private async showHelp(conversation: Conversation) {
    const helpMessage = `🌊 **RAINMAKER ARENA HELP** 🌊

🎮 Commands:
• /start - Start new game
• Type whale names to guess
• /help - Show this menu

Ready to hunt? 🚀`;

    await this.sendMessage(conversation, helpMessage);
  }

  private async sendMessage(conversation: Conversation, content: string) {
    try {
      await conversation.send(content);
      console.log('📤 Sent:', content.slice(0, 50) + '...');
    } catch (error) {
      console.error('❌ Send failed:', error);
    }
  }

  public async sendWhaleAlert(alert: { type: string; amount: string; whale: string; details: string }) {
    const alertMessage = `🚨 **WHALE ALERT!** 🚨
${alert.details}
Can you guess this whale? 🎯`;

    for (const gameRoom of this.gameRooms.values()) {
      if (gameRoom.isActive) {
        await this.sendMessage(gameRoom.conversation, alertMessage);
      }
    }
  }

  public onMessage(callback: (message: XMTPMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  public getBotAddress(): string | null {
    return this.wallet?.address || null;
  }
} 