'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Zap, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { WhaleHunterBot, XMTPMessage } from '@/lib/xmtpBot';
import { WhaleDetectionService } from '@/lib/whaleDetector';
import { cn } from '@/lib/utils';

interface ChatMessage extends XMTPMessage {
  isBot?: boolean;
  isAlert?: boolean;
}

export function XMTPChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [botAddress, setBotAddress] = useState<string | null>(null);
  const [messageCounter, setMessageCounter] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<WhaleHunterBot | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      const bot = new WhaleHunterBot();
      botRef.current = bot;
      
      setTimeout(() => {
        const address = bot.getBotAddress();
        setBotAddress(address);
        setIsConnected(!!address);
        
        const detector = new WhaleDetectionService(bot);
        
        bot.onMessage((message: XMTPMessage) => {
          setMessages(prev => [...prev, { ...message, isBot: false }]);
        });
        
        detector.startMonitoring();
        
        addBotMessage("🌧️ Welcome to Rainmaker Arena! Send '/start' to begin or '/help' for commands!");
        
        setIsLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to initialize:', error);
      setIsLoading(false);
      addBotMessage("❌ Failed to connect. Please refresh.");
    }
  };

  const addBotMessage = (content: string, isAlert: boolean = false) => {
    setMessageCounter(prev => prev + 1);
    const message: ChatMessage = {
      id: `bot_${Date.now()}_${messageCounter}`,
      content,
      sender: botAddress || 'bot',
      timestamp: new Date(),
      type: isAlert ? 'whale_alert' : 'bot',
      isBot: true,
      isAlert
    };
    
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessageCounter(prev => prev + 1);
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${messageCounter}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'player',
      isBot: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-96 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-white">Connecting to XMTP...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-96 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold">Rainmaker Arena Chat</span>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
        </div>
        
        {botAddress && (
          <div className="text-xs text-white/60">
            Bot: {botAddress.slice(0, 6)}...{botAddress.slice(-4)}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start space-x-3",
                message.isBot ? "justify-start" : "justify-end"
              )}
            >
              {message.isBot && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  {message.isAlert ? (
                    <Zap className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              )}
              
              <div className={cn(
                "max-w-xs px-4 py-2 rounded-2xl",
                message.isBot
                  ? "bg-blue-500/10 border border-blue-400/30 text-blue-100"
                  : "bg-green-500/10 border border-green-400/30 text-green-100"
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
              
              {!message.isBot && (
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type '/start' to begin..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          
          <motion.button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-500 rounded-xl text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 