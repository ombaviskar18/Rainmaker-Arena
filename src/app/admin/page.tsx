'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Wallet, 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';

interface SystemStats {
  systemStatus: {
    timestamp: string;
    uptime: number;
    environment: string;
  };
  userStats: {
    total: number;
    active: number;
    telegram: any;
    discord: any;
  };
  gameStats: {
    activePriceRounds: number;
    supportedCryptocurrencies: number;
    totalPredictions: number;
  };
  walletStats: {
    isInitialized: boolean;
    walletAddress: string | null;
    communityPoolBalance: string;
    weeklyDistributionAmount: string;
  };
  financialStats: {
    totalDistributions: number;
    completedDistributions: number;
    failedDistributions: number;
    totalDistributedAllTime: number;
    totalDistributedToday: number;
  };
  apiStatus: {
    coinGecko: string;
    alchemy: string;
    coinbase: string;
    telegram: string;
    discord: string;
  };
  alerts: Array<{
    type: string;
    message: string;
    action: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeBots = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/initialize-bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Bot initialization result:', result);
      
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to initialize bots:', error);
    } finally {
      setInitializing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'running': return 'text-green-400';
      case 'initializing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'initializing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-purple-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Rainmaker Arena Admin</h1>
            <p className="text-gray-400">
              System monitoring and control dashboard
              {lastRefresh && (
                <span className="ml-2">• Last updated: {lastRefresh.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchDashboardData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={initializeBots}
              disabled={initializing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {initializing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{initializing ? 'Initializing...' : 'Initialize Bots'}</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="space-y-3">
            {stats.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`backdrop-blur-xl rounded-lg border p-4 ${
                  alert.type === 'error' ? 'bg-red-500/10 border-red-400/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-400/30' :
                  'bg-blue-500/10 border-blue-400/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{alert.message}</p>
                    <p className="text-gray-400 text-sm mt-1">{alert.action}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Stats */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Users</h3>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{stats?.userStats.total || 0}</div>
              <div className="text-sm text-gray-400">
                {stats?.userStats.active || 0} active users
              </div>
              <div className="text-xs text-gray-500">
                TG: {stats?.userStats.telegram?.totalUsers || 0} • 
                DC: {stats?.userStats.discord?.totalUsers || 0}
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Game Activity</h3>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{stats?.gameStats.activePriceRounds || 0}</div>
              <div className="text-sm text-gray-400">Active rounds</div>
              <div className="text-xs text-gray-500">
                {stats?.gameStats.totalPredictions || 0} predictions • 
                {stats?.gameStats.supportedCryptocurrencies || 0} cryptos
              </div>
            </div>
          </div>

          {/* Wallet Stats */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Community Pool</h3>
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {parseFloat(stats?.walletStats.communityPoolBalance || '0').toFixed(4)} ETH
              </div>
              <div className="text-sm text-gray-400">
                {stats?.walletStats.isInitialized ? 'Initialized' : 'Not initialized'}
              </div>
              <div className="text-xs text-gray-500">
                Weekly: {stats?.walletStats.weeklyDistributionAmount || '0'} ETH
              </div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Distributions</h3>
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{stats?.financialStats.totalDistributions || 0}</div>
              <div className="text-sm text-gray-400">Total distributions</div>
              <div className="text-xs text-gray-500">
                {stats?.financialStats.completedDistributions || 0} completed • 
                {stats?.financialStats.failedDistributions || 0} failed
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2" />
            API Service Status
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats?.apiStatus && Object.entries(stats.apiStatus).map(([service, status]) => (
              <div key={service} className="flex items-center space-x-2">
                <span className={getStatusColor(status)}>{getStatusIcon(status)}</span>
                <div>
                  <div className="text-white text-sm font-medium capitalize">
                    {service === 'coinGecko' ? 'CoinGecko' : service}
                  </div>
                  <div className={`text-xs ${getStatusColor(status)}`}>
                    {status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        {stats?.systemStatus && (
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              System Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400">Environment</div>
                <div className="text-white font-medium">{stats.systemStatus.environment}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Uptime</div>
                <div className="text-white font-medium">
                  {Math.floor(stats.systemStatus.uptime / 3600)}h {Math.floor((stats.systemStatus.uptime % 3600) / 60)}m
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="text-white font-medium">
                  {new Date(stats.systemStatus.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            {stats.walletStats.walletAddress && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">CDP Wallet Address</div>
                <div className="text-white font-mono text-sm break-all">
                  {stats.walletStats.walletAddress}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 