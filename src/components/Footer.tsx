'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  MessageCircle, 
  Twitter, 
  Globe, 
  Code, 
  Zap, 
  Heart,
  ExternalLink,
  Shield,
  Target,
  TrendingUp,
  Users,
  Crown,
  DollarSign
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/ombaviskar18/Rainmaker-Arena',
      description: 'Open source code & contributions',
      color: 'hover:text-gray-300'
    },
    {
      name: 'Telegram Bot',
      icon: MessageCircle,
      url: 'https://t.me/Rain_maker_Arena_bot',
      description: 'Play live crypto predictions on Telegram',
      color: 'hover:text-blue-400'
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Multi-Chain Predictions',
      description: 'Real-time price predictions across 9 blockchains'
    },
    {
      icon: DollarSign,
      title: 'ETH Rewards',
      description: 'Earn real ETH via CDP wallet integration'
    },
    {
      icon: Crown,
      title: 'NFT Marketplace',
      description: 'Trade exclusive Base blockchain NFTs'
    },
    {
      icon: Zap,
      title: 'Live Gaming',
      description: 'Instant multiplayer prediction arena'
    }
  ];

  const techStack = [
    'Next.js 15', 'TypeScript', 'Coinbase CDP', 'Base Network', 'Tailwind CSS', 'Framer Motion'
  ];

  return (
    <footer className="relative bg-gradient-to-t from-gray-900 via-gray-800/95 to-gray-800/80 border-t border-white/10">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -top-40 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                {/* <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center"> */}
                  <img 
                    src="/rainlogo.png" 
                    alt="Rainmaker Arena"
                    className="w-16 h-10 object-contain"
                  />
                {/* </div> */}
                <div>
                  <h3 className="text-xl font-bold text-white">Rainmaker Arena</h3>
                  <p className="text-sm text-gray-400">Price Prediction Game Show</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The ultimate multi-chain crypto prediction arena. Predict price movements 
                across 9 blockchains, earn real ETH rewards via CDP wallet, and trade exclusive NFTs.
              </p>
              
              {/* Social Links */}
              <div className="flex flex-col space-y-2 pt-2">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${link.color}`}
                    title={link.description}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{link.name}</span>
                      <p className="text-xs text-gray-400">{link.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
              
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Core Features</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-white font-medium text-sm">{feature.title}</h5>
                      <p className="text-gray-400 text-xs">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tech Stack & Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Code className="w-5 h-5 text-green-400" />
                  <span>Built With</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index }}
                      className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md border border-gray-600/30 hover:border-gray-500/50 transition-colors"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Gaming Features</span>
                </h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🎯 <span className="text-white">Multi-Chain Predictions</span></p>
                  <p>💰 <span className="text-white">Real ETH Rewards</span></p>
                  <p>🖼️ <span className="text-white">NFT Marketplace</span></p>
                  <p>⚡ <span className="text-white">XMTP agents</span></p>
                  <p>📱 <span className="text-white">Telegram Integration</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-8"></div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>© {currentYear} Rainmaker Arena</span>
            <span>•</span>
            <a 
              href="https://github.com/ombaviskar18/Rainmaker-Arena" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Open Source Project
            </a>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
            <span>for the crypto gaming community</span>
          </div>
        </motion.div>

       
      </div>
    </footer>
  );
}; 