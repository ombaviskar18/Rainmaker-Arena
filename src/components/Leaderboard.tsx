'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Award, User, Coins } from 'lucide-react';

interface LeaderboardPlayer {
  rank: number;
  address: string;
  username: string;
  points: number;
  xp: number;
  level: number;
  gamesPlayed: number;
  winRate: number;
  lastActive: string;
  badge: 'rainmaker' | 'prophet' | 'predictor' | 'rookie' | 'newbie';
  nftAvatar?: string;
  earnings: number; // ETH earnings from predictions
  currentStreak: number;
  bestStreak: number;
}

// Generate realistic leaderboard data for Rainmaker Arena
const generateLeaderboardData = (): LeaderboardPlayer[] => {
  const addresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
    '0x6CC5F688a315f3dC28A7781717a9A798a59fDA7b', // Punk6529
    '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459', // Pranksy
    '0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872', // WhaleShark
    '0x8bc47Be1E3baCF3b77e8C1930f2073F5DD6C9f24', // Beanie
    '0x50EC05ADe8280758E2077fcBC08D878D4aef79C3',
    '0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00',
    '0x1919DB36cA2fa2e15C9BAe371A17F8c6B1e8DD1C',
    '0x8Ba1f109551bD432803012645Hac136c22C85A9C',
    '0x2f3C8F2C4E7A4B1C9D8E3F4A5B6C7D8E9F1A2B3C',
    '0x3A4B5C6D7E8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B',
    '0x4B5C6D7E8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C',
    '0x5C6D7E8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D',
    '0x6D7E8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E',
    '0x7E8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F',
    '0x8F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A',
    '0x9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B',
    '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9BC',
    '0xB1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0',
    '0xC2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
    '0xD3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2',
    '0xE4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3',
    '0xF5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4',
    '0xA6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5',
    '0xB7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6',
  ];

  const usernames = [
    'RainMaster', 'PriceProphet', 'CryptoSeer', 'ArenaChamp', 'EthEagle',
    'PredictionKing', 'ChainlinkLord', 'TokenTitan', 'FeedMaster', 'OracleWiz',
    'MarketMage', 'PriceHunter', 'CryptoGuru', 'ArenaLegend', 'DigitalDragon',
    'BlockchainBull', 'RainMaker', 'FeedNinja', 'PredictorPro', 'ArenaAce',
    'TokenTrader', 'ChainMaster', 'OracleOwl', 'PricePilot', 'CryptoChief'
  ];

  const badges: LeaderboardPlayer['badge'][] = ['rainmaker', 'prophet', 'predictor', 'rookie', 'newbie'];
  const timeAgo = ['2 min ago', '5 min ago', '10 min ago', '30 min ago', '1h ago', '2h ago', '5h ago', '1d ago'];

  return addresses.map((address, index) => {
    const basePoints = 50000 - (index * 1800) + Math.floor(Math.random() * 500);
    const xp = basePoints * 1.2 + Math.floor(Math.random() * 1000);
    const level = Math.floor(xp / 5000) + 1;
    const gamesPlayed = Math.floor(Math.random() * 100) + 50;
    const winRate = Math.max(20, 95 - (index * 2) + Math.floor(Math.random() * 10));
    const earnings = (Math.random() * 5 + 0.1) * (1 - index * 0.03); // ETH earnings
    const currentStreak = Math.floor(Math.random() * 15);
    const bestStreak = currentStreak + Math.floor(Math.random() * 10);

    return {
      rank: index + 1,
      address,
      username: usernames[index],
      points: basePoints,
      xp,
      level,
      gamesPlayed,
      winRate,
      lastActive: timeAgo[Math.floor(Math.random() * timeAgo.length)],
      badge: index < 3 ? 'rainmaker' : index < 8 ? 'prophet' : index < 15 ? 'predictor' : index < 22 ? 'rookie' : 'newbie',
      earnings,
      currentStreak,
      bestStreak
    };
  });
};

const getBadgeColor = (badge: LeaderboardPlayer['badge']) => {
  switch (badge) {
    case 'rainmaker': return 'text-purple-400 bg-purple-500/20 border-purple-400/30';
    case 'prophet': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
    case 'predictor': return 'text-cyan-400 bg-cyan-500/20 border-cyan-400/30';
    case 'rookie': return 'text-green-400 bg-green-500/20 border-green-400/30';
    case 'newbie': return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
  }
};

const getBadgeEmoji = (badge: LeaderboardPlayer['badge']) => {
  switch (badge) {
    case 'rainmaker': return '🌧️';
    case 'prophet': return '🔮';
    case 'predictor': return '📈';
    case 'rookie': return '⭐';
    case 'newbie': return '🌱';
  }
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
  if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
  return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
};

export const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [filter, setFilter] = useState<'all' | 'rainmaker' | 'prophet' | 'predictor'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPlayers(generateLeaderboardData());
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesFilter = filter === 'all' || player.badge === filter;
    const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Rainmaker Arena Leaderboard
          </h1>
          <Trophy className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <p className="text-gray-400 text-lg">
          Top price prediction champions earning real ETH rewards
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-2">
          {(['all', 'rainmaker', 'prophet', 'predictor'] as const).map((filterType) => (
            <motion.button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === filterType
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterType === 'all' ? 'All Players' : 
               filterType === 'rainmaker' ? '🌧️ Rainmakers' :
               filterType === 'prophet' ? '🔮 Prophets' : '📈 Predictors'}
            </motion.button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 w-64"
          />
          <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {filteredPlayers.slice(0, 3).map((player, index) => (
          <motion.div
            key={player.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative backdrop-blur-xl rounded-xl border p-6 text-center ${
              index === 0 
                ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
                : index === 1
                ? 'bg-gradient-to-b from-gray-400/20 to-gray-600/20 border-gray-400/30'
                : 'bg-gradient-to-b from-orange-400/20 to-red-500/20 border-orange-400/30'
            }`}
          >
            <div className="mb-4">
              {getRankIcon(player.rank)}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{player.username}</h3>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm border ${getBadgeColor(player.badge)}`}>
                {getBadgeEmoji(player.badge)} {player.badge.toUpperCase()}
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {player.points.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-green-400">
                {player.earnings.toFixed(3)} ETH
              </div>
              <div className="text-sm text-gray-400">
                Level {player.level} • {player.winRate}% WR • {player.currentStreak} streak
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Player</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Badge</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Points</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Earnings</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Win Rate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Streak</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.slice(3).map((player, index) => (
                <motion.tr
                  key={player.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 3) * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{player.username}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      {`${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs border ${getBadgeColor(player.badge)}`}>
                      {getBadgeEmoji(player.badge)} {player.badge.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-yellow-400">
                    {player.points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-green-400">
                    {player.earnings.toFixed(3)} ETH
                  </td>
                  <td className="px-6 py-4 text-center text-white">
                    {player.level}
                  </td>
                  <td className="px-6 py-4 text-center text-white">
                    {player.winRate}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      <div className="text-white font-semibold">{player.currentStreak}</div>
                      <div className="text-xs text-gray-400">Best: {player.bestStreak}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 text-sm">
                    {player.lastActive}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">25</div>
          <div className="text-sm text-gray-400">Total Players</div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6 text-center">
          <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {players.reduce((sum, p) => sum + p.points, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Points</div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6 text-center">
          <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(players.reduce((sum, p) => sum + p.winRate, 0) / players.length)}%
          </div>
          <div className="text-sm text-gray-400">Avg Win Rate</div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {players.reduce((sum, p) => sum + p.gamesPlayed, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Games</div>
        </div>
      </div>
    </div>
  );
}; 