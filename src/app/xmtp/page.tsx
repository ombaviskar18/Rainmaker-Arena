'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  Activity,
  AlertTriangle,
  Wifi,
  Rocket
} from 'lucide-react';

// Dynamically import components to avoid SSR issues
const XMTPGameChatDynamic = dynamic(
  () => import('../../components/XMTPGameChat').then((mod) => ({ default: mod.XMTPGameChat })),
  { 
    ssr: false,
    loading: () => (
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading Enhanced Rainmaker Arena Bot...</p>
      </div>
    )
  }
);

const DetectWhaleGameDynamic = dynamic(
  () => import('../../components/DetectWhaleGame').then((mod) => ({ default: mod.DetectWhaleGame })),
  { 
    ssr: false,
    loading: () => (
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Whale Detection Game...</p>
      </div>
    )
  }
);

interface UserStats {
  score: number;
  xp: number;
  level: number;
  completedThemes: number;
}

interface ServiceStats {
  botAddress: string;
  activeSessions: number;
}

interface WhaleAlert {
  id: string;
  whale: string;
  action: string;
  amount: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function XMTPPage() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({
    score: 2847,
    xp: 15420,
    level: 8,
    completedThemes: 4
  });
  
  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    botAddress: ' 0x742d35C...329980A44D7F',
    activeSessions: 23
  });

  const [recentWhaleAlerts, setRecentWhaleAlerts] = useState<WhaleAlert[]>([
    {
      id: '1',
      whale: 'Vitalik Buterin',
      action: 'Donated 200 ETH to Gitcoin matching fund',
      amount: '200 ETH ($482,000)',
      time: '2 min ago',
      severity: 'high'
    },
    {
      id: '2', 
      whale: 'Punk6529',
      action: 'Acquired rare CryptoPunk #1543',
      amount: '85 ETH ($205,400)',
      time: '8 min ago',
      severity: 'medium'
    },
    {
      id: '3',
      whale: 'Institutional Wallet',
      action: 'Transferred to Coinbase custody',
      amount: '1,500 ETH ($3.6M)',
      time: '15 min ago',
      severity: 'critical'
    },
    {
      id: '4',
      whale: 'WhaleShark',
      action: 'Added rare Art Blocks to $WHALE vault',
      amount: '12 NFTs ($180,000)',
      time: '23 min ago',
      severity: 'medium'
    },
    {
      id: '5',
      whale: 'DeFi Protocol Whale',
      action: 'Unstaked from Ethereum 2.0',
      amount: '320 ETH ($772,800)',
      time: '31 min ago',
      severity: 'high'
    }
  ]);

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update user stats when game score changes
  useEffect(() => {
    if (mounted) {
      setUserStats(prev => ({
        ...prev,
        score: prev.score + gameScore,
        xp: prev.xp + (gameScore * 2)
      }));
    }
  }, [gameScore, mounted]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/20 border-red-400/30 text-red-300';
      case 'high': return 'bg-orange-600/20 border-orange-400/30 text-orange-300';
      case 'medium': return 'bg-yellow-600/20 border-yellow-400/30 text-yellow-300';
      default: return 'bg-blue-600/20 border-blue-400/30 text-blue-300';
    }
  };

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading XMTP Rainmaker Arena...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-4xl font-bold text-white mb-4">Connect Wallet Required</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Connect your wallet to access the XMTP Rainmaker Arena experience with live chat, 
              trivia games, and real-time whale detection.
            </p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">XMTP Rainmaker Arena</h1>
                <p className="text-gray-400">Real-time whale detection & trivia gaming</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/coming-soon"
                className="flex items-center space-x-2 bg-purple-500/20 px-3 py-2 rounded-lg border border-purple-400/30 hover:bg-purple-500/30 transition-colors"
              >
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Coming Soon</span>
              </Link>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-lg border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Live Monitoring</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">
                  Score: {userStats.score} | XP: {userStats.xp} | Lv. {userStats.level}
                </div>
                <div className="text-gray-400 text-sm">
                  Themes: {userStats.completedThemes}/6 | Sessions: {serviceStats.activeSessions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Mobile Layout - Stack vertically */}
        <div className="block lg:hidden space-y-6">
          
          {/* XMTP Chat - Full width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="h-80 sm:h-96">
              <XMTPGameChatDynamic />
            </div>
          </motion.div>

          {/* DetectWhale Game - Full width on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
          >
            <div className="h-80">
              <DetectWhaleGameDynamic onScoreUpdate={setGameScore} />
            </div>
          </motion.div>

          {/* Service Status & Alerts - Full width stacked on mobile */}
          <div className="w-full space-y-4">
            
            {/* Service Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Service Status</span>
                </h3>
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">XMTP Service</span>
                  <span className="text-green-400 font-medium text-sm">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Bot Address</span>
                  <span className="text-white text-xs truncate max-w-32">{serviceStats.botAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Sessions</span>
                  <span className="text-white font-medium text-sm">{serviceStats.activeSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Whale Monitoring</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Whale Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Live Alerts</span>
                </h3>
                <div className="text-xs text-gray-400">Real-time</div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {recentWhaleAlerts.slice(0, 4).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="font-medium text-xs">{alert.whale}</div>
                    <div className="text-xs opacity-80 mt-1">{alert.action}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-xs">{alert.amount}</span>
                      <span className="text-xs opacity-60">{alert.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Desktop Layout - 3 column grid */}
        <div className="hidden lg:grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
          
          {/* Left Sidebar - DetectWhale Game */}
          <div className="col-span-3 h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <DetectWhaleGameDynamic onScoreUpdate={setGameScore} />
            </motion.div>
          </div>

          {/* Center - XMTP Chat */}
          <div className="col-span-6 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <XMTPGameChatDynamic />
            </motion.div>
          </div>

          {/* Right Sidebar - Service Status & Alerts */}
          <div className="col-span-3 h-full overflow-y-auto scrollbar-enhanced">
            <div className="space-y-6 h-full">
              
              {/* Service Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>Service Status</span>
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">XMTP Service</span>
                    <span className="text-green-400 font-medium">Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Bot Address</span>
                    <span className="text-white text-sm">{serviceStats.botAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Sessions</span>
                    <span className="text-white font-medium">{serviceStats.activeSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Whale Monitoring</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Live Whale Alerts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 p-4 flex-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <span>Live Alerts</span>
                  </h3>
                  <div className="text-xs text-gray-400">Real-time</div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                  {recentWhaleAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="font-medium text-sm">{alert.whale}</div>
                      <div className="text-xs opacity-80 mt-1">{alert.action}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm">{alert.amount}</span>
                        <span className="text-xs opacity-60">{alert.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
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
