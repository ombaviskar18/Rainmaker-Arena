'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/xmtp"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to XMTP</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Coming Soon Features</h1>
              <p className="text-gray-400">The future of whale hunting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            🚀 Coming Soon
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Exciting new features are on the horizon! Get ready for the next evolution of whale hunting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Custom AI Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-xl border border-white/20 p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Custom AI Agents</h3>
            <p className="text-gray-400 text-sm mb-3 sm:mb-4">
              Create multiple AI agents using simple prompts and launch them with XMTP integration. 
              Build your own whale hunting bots with custom personalities and strategies.
            </p>
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">In Development</span>
            </div>
          </motion.div>

          {/* NFT Marketplace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-pink-600/20 to-orange-600/20 backdrop-blur-xl rounded-xl border border-white/20 p-4 sm:p-6 hover:border-pink-400/50 transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">NFT Marketplace</h3>
            <p className="text-gray-400 text-sm mb-3 sm:mb-4">
              Guess whales correctly, earn points, and claim exclusive NFTs! Trade your whale hunter 
              achievements in our dedicated marketplace with other players.
            </p>
            <div className="flex items-center space-x-2 text-pink-400">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">Upcoming</span>
            </div>
          </motion.div>

          {/* Tournament System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-gradient-to-br from-green-600/20 to-teal-600/20 backdrop-blur-xl rounded-xl border border-white/20 p-4 sm:p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Tournament System</h3>
            <p className="text-gray-400 text-sm mb-3 sm:mb-4">
              Game creators can host tournaments where players compete in group chats. 
              Winners share prize pools and earn exclusive rewards and recognition.
            </p>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">Beta Testing</span>
            </div>
          </motion.div>

          {/* Whale Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group bg-gradient-to-br from-yellow-600/20 to-red-600/20 backdrop-blur-xl rounded-xl border border-white/20 p-4 sm:p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Whale Reports</h3>
            <p className="text-gray-400 text-sm mb-3 sm:mb-4">
              Create and sell comprehensive whale analysis reports. Share your trading strategies, 
              technical analysis, and market insights to help new traders succeed.
            </p>
            <div className="flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">Research Phase</span>
            </div>
          </motion.div>

        </div>

        {/* Additional Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">More Features in the Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="text-2xl mb-4">⚡</div>
              <h4 className="text-lg font-bold text-white mb-2">Real-time Analytics</h4>
              <p className="text-gray-400 text-sm">Advanced whale tracking with instant notifications and portfolio analysis.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="text-2xl mb-4">🎯</div>
              <h4 className="text-lg font-bold text-white mb-2">Smart Alerts</h4>
              <p className="text-gray-400 text-sm">Customizable alerts based on whale behavior patterns and market movements.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="text-2xl mb-4">🌐</div>
              <h4 className="text-lg font-bold text-white mb-2">Multi-Chain Support</h4>
              <p className="text-gray-400 text-sm">Track whales across multiple blockchains and DeFi protocols.</p>
            </div>

          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-6">Be the first to know when these exciting features launch!</p>
            <Link 
              href="/xmtp"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span>Back to Whale Hunter</span>
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
      </div>
    </div>
  );
} 