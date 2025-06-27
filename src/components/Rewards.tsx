'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Coins, 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Gem, 
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'nft' | 'token' | 'badge' | 'access' | 'physical';
  pointsCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  network: 'ethereum' | 'base' | 'polygon';
  icon: string;
  image?: string;
  contractAddress?: string;
  tokenId?: string;
  quantity: number;
  maxSupply: number;
  claimed: boolean;
  requirements?: string[];
  expiresAt?: string;
}

const MOCK_REWARDS: Reward[] = [
  // NFT Rewards
  {
    id: 'rainmaker-genesis',
    title: 'Rainmaker Arena Genesis NFT',
    description: 'Exclusive genesis NFT for early rainmakers. Gives access to special events and airdrops.',
    type: 'nft',
    pointsCost: 50000,
    rarity: 'legendary',
    network: 'base',
    icon: '🌧️',
    contractAddress: '0x742d35Cc6634C0532925a3b8D72ddf2a01e7a2b5',
    tokenId: '1',
    quantity: 47,
    maxSupply: 100,
    claimed: false,
    requirements: ['Level 10+', 'Win 50+ predictions']
  },
  {
    id: 'price-prophet-badge',
    title: 'Price Prophet Badge',
    description: 'NFT badge proving your price prediction skills. Show off your expertise!',
    type: 'nft',
    pointsCost: 25000,
    rarity: 'epic',
    network: 'base',
    icon: '🔮',
    contractAddress: '0x892c8c1e3c4f7d2c9e8b2a3c4d5e6f7a8b9c0d1e',
    quantity: 124,
    maxSupply: 500,
    claimed: false,
    requirements: ['Level 5+']
  },
  {
    id: 'prediction-oracle-nft',
    title: 'Prediction Oracle NFT',
    description: 'Dynamic NFT that updates based on your prediction achievements.',
    type: 'nft',
    pointsCost: 15000,
    rarity: 'rare',
    network: 'base',
    icon: '📈',
    quantity: 256,
    maxSupply: 1000,
    claimed: false
  },

  // Token Rewards
  {
    id: 'base-eth-tokens',
    title: 'Base Testnet ETH',
    description: 'Get 0.1 ETH on Base testnet to test transactions and smart contracts.',
    type: 'token',
    pointsCost: 5000,
    rarity: 'common',
    network: 'base',
    icon: '⚡',
    quantity: 999,
    maxSupply: 10000,
    claimed: false,
    expiresAt: '2024-12-31'
  },
  {
    id: 'rain-token',
    title: '$RAIN Social Token',
    description: 'Exclusive rainmaker community token with governance rights.',
    type: 'token',
    pointsCost: 10000,
    rarity: 'rare',
    network: 'ethereum',
    icon: '🌧️',
    contractAddress: '0x9355372396e3F6daF13359B7b607a3374cc638e0',
    quantity: 500,
    maxSupply: 2000,
    claimed: false,
    requirements: ['Complete 10 predictions']
  },
  {
    id: 'usdc-reward',
    title: '50 USDC',
    description: 'Real USDC tokens on Base network. Limited time offer!',
    type: 'token',
    pointsCost: 75000,
    rarity: 'legendary',
    network: 'base',
    icon: '💰',
    contractAddress: '0xA0b86a33E6c7937cc0e3ED59d9FE7d3e8b2C5c6D',
    quantity: 12,
    maxSupply: 50,
    claimed: false,
    requirements: ['Level 15+', 'Top 10 leaderboard'],
    expiresAt: '2024-07-01'
  },

  // Badge Rewards
  {
    id: 'storm-predictor',
    title: 'Storm Predictor Badge',
    description: 'Digital badge for your first correct price prediction.',
    type: 'badge',
    pointsCost: 1000,
    rarity: 'common',
    network: 'base',
    icon: '⛈️',
    quantity: 1847,
    maxSupply: 5000,
    claimed: true
  },
  {
    id: 'rainmaker-master',
    title: 'Rainmaker Master Badge',
    description: 'Awarded for achieving rainmaker mastery status.',
    type: 'badge',
    pointsCost: 25000,
    rarity: 'rare',
    network: 'ethereum',
    icon: '🏅',
    quantity: 250,
    maxSupply: 500,
    claimed: false,
    requirements: ['Win Rate 80%+', 'Level 8+']
  },
  {
    id: 'prediction-master',
    title: 'Prediction Master Badge',
    description: 'Awarded for perfect scores in price prediction challenges.',
    type: 'badge',
    pointsCost: 8000,
    rarity: 'epic',
    network: 'base',
    icon: '🧠',
    quantity: 89,
    maxSupply: 200,
    claimed: false,
    requirements: ['Score 100% on 5 predictions']
  },

  // Access Rewards
  {
    id: 'prediction-oracle',
    title: 'Price Oracle Access',
    description: 'Exclusive access to advanced price prediction tools and analytics.',
    type: 'access',
    pointsCost: 75000,
    rarity: 'legendary',
    network: 'ethereum',
    icon: '🔮',
    quantity: 25,
    maxSupply: 50,
    claimed: false,
    requirements: ['Level 15+', 'Top 10 leaderboard'],
    expiresAt: 'Dec 31, 2024'
  },
  {
    id: 'vip-channel',
    title: 'VIP Discord Channel',
    description: 'Access to exclusive Discord channels with price signals and insider predictions.',
    type: 'access',
    pointsCost: 20000,
    rarity: 'rare',
    network: 'polygon',
    icon: '💎',
    quantity: 200,
    maxSupply: 300,
    claimed: false,
    requirements: ['Discord member', 'Level 7+']
  },
  {
    id: 'early-access',
    title: 'Early Access Pass',
    description: 'Get early access to new prediction games and beta testing opportunities.',
    type: 'access',
    pointsCost: 5000,
    rarity: 'common',
    network: 'base',
    icon: '🎫',
    quantity: 800,
    maxSupply: 1000,
    claimed: false
  },
  {
    id: 'vip-chat-access',
    title: 'VIP Chat Access',
    description: 'Access to exclusive XMTP channels with prediction pros.',
    type: 'access',
    pointsCost: 20000,
    rarity: 'epic',
    network: 'ethereum',
    icon: '💬',
    quantity: 67,
    maxSupply: 150,
    claimed: false,
    requirements: ['Level 8+'],
    expiresAt: '2025-01-01'
  },
  {
    id: 'early-feature-access',
    title: 'Beta Features Access',
    description: 'Get early access to new prediction features and AI improvements.',
    type: 'access',
    pointsCost: 12000,
    rarity: 'rare',
    network: 'base',
    icon: '🚀',
    quantity: 143,
    maxSupply: 300,
    claimed: false
  },

  // Physical Rewards
  {
    id: 'rainmaker-hoodie',
    title: 'Rainmaker Arena Hoodie',
    description: 'Exclusive merchandise shipped worldwide. Premium quality cotton.',
    type: 'physical',
    pointsCost: 30000,
    rarity: 'rare',
    network: 'ethereum',
    icon: '🧥',
    quantity: 100,
    maxSupply: 200,
    claimed: false,
    requirements: ['Level 10+', 'Top 100 leaderboard']
  }
];

const getRarityColor = (rarity: Reward['rarity']) => {
  switch (rarity) {
    case 'common': return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    case 'rare': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
    case 'epic': return 'text-purple-400 bg-purple-500/20 border-purple-400/30';
    case 'legendary': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
  }
};

const getTypeIcon = (type: Reward['type']) => {
  switch (type) {
    case 'nft': return <Gem className="w-5 h-5" />;
    case 'token': return <Coins className="w-5 h-5" />;
    case 'badge': return <Star className="w-5 h-5" />;
    case 'access': return <Crown className="w-5 h-5" />;
    case 'physical': return <Gift className="w-5 h-5" />;
  }
};

const getNetworkColor = (network: Reward['network']) => {
  switch (network) {
    case 'ethereum': return 'text-blue-400 bg-blue-500/20';
    case 'base': return 'text-indigo-400 bg-indigo-500/20';
    case 'polygon': return 'text-purple-400 bg-purple-500/20';
  }
};

interface RewardsProps {
  userPoints: number;
  userLevel: number;
}

export const Rewards: React.FC<RewardsProps> = ({ userPoints = 15000, userLevel = 7 }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nft' | 'token' | 'badge' | 'access' | 'physical'>('all');
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<string[]>(['storm-predictor']);
  
  const { isConnected } = useAccount();

  const categories = [
    { id: 'all', label: 'All Rewards', icon: Gift },
    { id: 'nft', label: 'NFTs', icon: Gem },
    { id: 'token', label: 'Tokens', icon: Coins },
    { id: 'badge', label: 'Badges', icon: Star },
    { id: 'access', label: 'Access', icon: Crown },
    { id: 'physical', label: 'Physical', icon: Gift },
  ];

  const filteredRewards = MOCK_REWARDS.filter(reward => 
    selectedCategory === 'all' || reward.type === selectedCategory
  );

  const canClaimReward = (reward: Reward) => {
    if (!isConnected) return false;
    if (claimedRewards.includes(reward.id)) return false;
    if (userPoints < reward.pointsCost) return false;
    if (reward.quantity <= 0) return false;
    
    // Check level requirements
    if (reward.requirements?.some(req => req.includes('Level'))) {
      const levelReq = reward.requirements.find(req => req.includes('Level'));
      const requiredLevel = parseInt(levelReq?.match(/\d+/)?.[0] || '0');
      if (userLevel < requiredLevel) return false;
    }
    
    return true;
  };

  const handleClaimReward = async (reward: Reward) => {
    if (!canClaimReward(reward)) return;
    
    setClaimingReward(reward.id);
    
    // Simulate claiming process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setClaimedRewards(prev => [...prev, reward.id]);
    setClaimingReward(null);
    
    // In a real app, this would interact with smart contracts
    console.log(`Claimed reward: ${reward.title}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Rainmaker Arena Rewards
          </h1>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <p className="text-gray-400 text-lg">
          Claim exclusive rewards with your prediction points and ETH earnings
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{userPoints.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Available Points</div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">{userLevel}</div>
          <div className="text-sm text-gray-400">Current Level</div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{claimedRewards.length}</div>
          <div className="text-sm text-gray-400">Rewards Claimed</div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-xl rounded-xl border p-6 relative overflow-hidden ${
              canClaimReward(reward) 
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-purple-400/50' 
                : 'bg-white/5 border-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            {/* Rarity Glow */}
            {reward.rarity === 'legendary' && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl" />
            )}
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{reward.icon}</div>
                <div>
                  <h3 className="font-bold text-white text-lg">{reward.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getRarityColor(reward.rarity)}`}>
                      {getTypeIcon(reward.type)}
                      <span className="capitalize">{reward.rarity}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getNetworkColor(reward.network)}`}>
                      {reward.network}
                    </div>
                  </div>
                </div>
              </div>
              
              {claimedRewards.includes(reward.id) && (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {reward.description}
            </p>

            {/* Requirements */}
            {reward.requirements && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Requirements:</div>
                <div className="space-y-1">
                  {reward.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-orange-400" />
                      <span className="text-gray-400">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="text-gray-400">
                {reward.quantity}/{reward.maxSupply} available
              </div>
              {reward.expiresAt && (
                <div className="flex items-center space-x-1 text-orange-400">
                  <Clock className="w-4 h-4" />
                  <span>Expires {reward.expiresAt}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(reward.quantity / reward.maxSupply) * 100}%` }}
              />
            </div>

            {/* Action Button */}
            <motion.button
              onClick={() => handleClaimReward(reward)}
              disabled={!canClaimReward(reward) || claimingReward === reward.id}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                claimedRewards.includes(reward.id)
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30 cursor-not-allowed'
                  : canClaimReward(reward)
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed'
              }`}
              whileHover={canClaimReward(reward) ? { scale: 1.02 } : {}}
              whileTap={canClaimReward(reward) ? { scale: 0.98 } : {}}
            >
              {claimedRewards.includes(reward.id) ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Claimed</span>
                </>
              ) : claimingReward === reward.id ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : !isConnected ? (
                <>
                  <span>Connect Wallet</span>
                </>
              ) : userPoints < reward.pointsCost ? (
                <>
                  <Coins className="w-5 h-5" />
                  <span>{reward.pointsCost.toLocaleString()} Points</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Claim for {reward.pointsCost.toLocaleString()}</span>
                </>
              )}
            </motion.button>

            {/* Contract Link */}
            {reward.contractAddress && (
              <motion.a
                href={`https://basescan.org/address/${reward.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 mt-3 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Contract</span>
              </motion.a>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No rewards found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}; 