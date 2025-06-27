'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Grid, 
  List,
  Trophy,
  Gem,
  Eye,
  Calendar,
  DollarSign,
  Zap,
  Star,
  TrendingUp,
  Upload,
  Palette
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface BaseNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number; // in ETH
  currency: 'ETH' | 'BASE';
  creator: string;
  owner: string;
  collection: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  views: number;
  likes: number;
  isListed: boolean;
  createdAt: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export const NFTMarketplace: React.FC = () => {
  const [nfts, setNfts] = useState<BaseNFT[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<BaseNFT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'popular'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFT, setSelectedNFT] = useState<BaseNFT | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const { address, isConnected } = useAccount();

  // Mock data for Base chain NFTs with real images
  const mockBaseNFTs: BaseNFT[] = [
    {
      id: '1',
      name: 'Royal Crown Collection',
      description: 'Majestic crown NFT symbolizing leadership in the crypto kingdom',
      image: '/king.png',
      price: 0.5,
      currency: 'ETH',
      creator: '0x1234...5678',
      owner: '0x1234...5678',
      collection: 'Royal Dynasty',
      rarity: 'Legendary',
      category: 'Collectibles',
      views: 1250,
      likes: 89,
      isListed: true,
      createdAt: '2024-01-15',
      attributes: [
        { trait_type: 'Type', value: 'Royal Crown' },
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Power', value: 'Leadership' }
      ]
    },
    {
      id: '2',
      name: 'Crypto Money Stack',
      description: 'Digital representation of financial prosperity and wealth accumulation',
      image: '/monkey.png',
      price: 0.15,
      currency: 'ETH',
      creator: '0xabcd...efgh',
      owner: '0x9876...5432',
      collection: 'Wealth Builders',
      rarity: 'Rare',
      category: 'Art',
      views: 890,
      likes: 45,
      isListed: true,
      createdAt: '2024-01-20',
      attributes: [
        { trait_type: 'Type', value: 'Currency Stack' },
        { trait_type: 'Value', value: 'High' },
        { trait_type: 'Theme', value: 'Prosperity' }
      ]
    },
    {
      id: '3',
      name: 'London Bridge Heritage',
      description: 'Iconic London landmark representing global crypto adoption',
      image: '/lon.png',
      price: 0.8,
      currency: 'ETH',
      creator: '0xdefi...1234',
      owner: '0xdefi...1234',
      collection: 'World Landmarks',
      rarity: 'Epic',
      category: 'Art',
      views: 2100,
      likes: 156,
      isListed: true,
      createdAt: '2024-01-10',
      attributes: [
        { trait_type: 'Location', value: 'London' },
        { trait_type: 'Era', value: 'Historic' },
        { trait_type: 'Significance', value: 'Global' }
      ]
    },
    {
      id: '4',
      name: 'Mysterious Mon Token',
      description: 'Enigmatic digital asset with hidden utilities and powers',
      image: '/mon.png',
      price: 0.25,
      currency: 'ETH',
      creator: '0xmusic...abcd',
      owner: '0xmusic...abcd',
      collection: 'Mystery Collection',
      rarity: 'Uncommon',
      category: 'Utility',
      views: 650,
      likes: 78,
      isListed: true,
      createdAt: '2024-01-25',
      attributes: [
        { trait_type: 'Mystery Level', value: 'High' },
        { trait_type: 'Utility', value: 'Hidden' },
        { trait_type: 'Rarity', value: 'Uncommon' }
      ]
    },
    {
      id: '5',
      name: 'HMS Naval Heritage',
      description: 'Historic naval vessel representing maritime blockchain exploration',
      image: '/hms.png',
      price: 1.2,
      currency: 'ETH',
      creator: '0xbase...official',
      owner: '0xcollector...xyz',
      collection: 'Maritime Legacy',
      rarity: 'Legendary',
      category: 'Collectibles',
      views: 3200,
      likes: 245,
      isListed: true,
      createdAt: '2024-01-05',
      attributes: [
        { trait_type: 'Type', value: 'Naval Ship' },
        { trait_type: 'Era', value: 'Historic' },
        { trait_type: 'Significance', value: 'Maritime' }
      ]
    },
    {
      id: '6',
      name: 'HRS Time Collection',
      description: 'Temporal NFT representing the value of time in the digital age',
      image: '/hrs.png',
      price: 0.35,
      currency: 'ETH',
      creator: '0xgame...dev',
      owner: '0xgamer...123',
      collection: 'Time Keepers',
      rarity: 'Rare',
      category: 'Utility',
      views: 1100,
      likes: 92,
      isListed: true,
      createdAt: '2024-01-18',
      attributes: [
        { trait_type: 'Concept', value: 'Time' },
        { trait_type: 'Utility', value: 'Temporal' },
        { trait_type: 'Rarity', value: 'Time-Limited' }
      ]
    },
    {
      id: '7',
      name: 'TGR Elite Gaming Token',
      description: 'Exclusive gaming NFT representing elite status in the crypto gaming arena',
      image: '/tgr.png',
      price: 0.65,
      currency: 'ETH',
      creator: '0xgaming...elite',
      owner: '0xgaming...elite',
      collection: 'Gaming Legends',
      rarity: 'Epic',
      category: 'Gaming',
      views: 1850,
      likes: 127,
      isListed: true,
      createdAt: '2024-01-30',
      attributes: [
        { trait_type: 'Type', value: 'Gaming Token' },
        { trait_type: 'Level', value: 'Elite' },
        { trait_type: 'Power', value: 'Gaming Mastery' },
        { trait_type: 'Edition', value: 'Limited' }
      ]
    },
    {
      id: '8',
      name: 'SHBB Cyber Shield',
      description: 'Advanced cybersecurity NFT providing digital protection and blockchain security',
      image: '/shbb.png',
      price: 0.45,
      currency: 'ETH',
      creator: '0xcyber...security',
      owner: '0xtech...guardian',
      collection: 'Cyber Defense',
      rarity: 'Rare',
      category: 'Utility',
      views: 980,
      likes: 74,
      isListed: true,
      createdAt: '2024-02-01',
      attributes: [
        { trait_type: 'Type', value: 'Security Shield' },
        { trait_type: 'Protection Level', value: 'Advanced' },
        { trait_type: 'Technology', value: 'Blockchain' },
        { trait_type: 'Defense Rating', value: 9.2 }
      ]
    }
  ];

  useEffect(() => {
    // Load mock data
    setLoading(true);
    setTimeout(() => {
      setNfts(mockBaseNFTs);
      setFilteredNFTs(mockBaseNFTs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter and sort NFTs
    let filtered = nfts.filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nft.collection.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || nft.category === selectedCategory;
      const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity;
      
      return matchesSearch && matchesCategory && matchesRarity;
    });

    // Sort NFTs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'popular':
          return (b.likes + b.views) - (a.likes + a.views);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredNFTs(filtered);
  }, [nfts, searchTerm, selectedCategory, selectedRarity, sortBy]);

  const categories = ['all', 'Art', 'Gaming', 'Music', 'Utility', 'Collectibles'];
  const rarities = ['all', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const toggleFavorite = (nftId: string) => {
    setUserFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(nftId)) {
        newFavorites.delete(nftId);
      } else {
        newFavorites.add(nftId);
      }
      return newFavorites;
    });
  };

  const buyNFT = (nft: BaseNFT) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }
    
    // Simulate purchase
    alert(`Successfully purchased ${nft.name} for ${nft.price} ${nft.currency}!`);
    
    // Update NFT ownership
    setNfts(prev => prev.map(n => 
      n.id === nft.id 
        ? { ...n, owner: address || '0x...', isListed: false }
        : n
    ));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Uncommon': return 'text-green-400 border-green-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Gem className="w-16 h-16 text-purple-400 mx-auto" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Base NFT Marketplace
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover, buy, sell, and create NFTs on the Base blockchain with zero gas fees!
            </p>
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-400/30">
              <span>⚠️</span>
              <span className="font-semibold">Connect your wallet to start trading!</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <Gem className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Base NFT Marketplace
          </h1>
          <Gem className="w-8 h-8 text-purple-400" />
        </motion.div>
        <p className="text-gray-400 text-lg">
          Trade NFTs on Base blockchain with lightning-fast transactions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create NFT</span>
        </button>
        
        <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 border border-white/20 transition-all">
          <Upload className="w-5 h-5" />
          <span>List for Sale</span>
        </button>
        
        <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 border border-white/20 transition-all">
          <Trophy className="w-5 h-5" />
          <span>My Collection</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search NFTs, collections, creators..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            <select
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
            >
              {rarities.map(rarity => (
                <option key={rarity} value={rarity} className="bg-gray-800">
                  {rarity === 'all' ? 'All Rarities' : rarity}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent" className="bg-gray-800">Recently Added</option>
              <option value="price_low" className="bg-gray-800">Price: Low to High</option>
              <option value="price_high" className="bg-gray-800">Price: High to Low</option>
              <option value="popular" className="bg-gray-800">Most Popular</option>
            </select>

            <div className="flex border border-white/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-500' : 'bg-white/10'} hover:bg-purple-400 transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-500' : 'bg-white/10'} hover:bg-purple-400 transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{filteredNFTs.length}</div>
          <div className="text-sm text-gray-400">Available NFTs</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {filteredNFTs.reduce((sum, nft) => sum + nft.price, 0).toFixed(2)} ETH
          </div>
          <div className="text-sm text-gray-400">Total Volume</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {(filteredNFTs.reduce((sum, nft) => sum + nft.price, 0) / filteredNFTs.length || 0).toFixed(3)} ETH
          </div>
          <div className="text-sm text-gray-400">Average Price</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {new Set(filteredNFTs.map(nft => nft.collection)).size}
          </div>
          <div className="text-sm text-gray-400">Collections</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-purple-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Base NFTs...</p>
        </div>
      )}

      {/* NFT Grid */}
      {!loading && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 overflow-hidden hover:border-purple-400/50 transition-all group ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/60`}>
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-full object-cover filter brightness-75 contrast-125 saturate-75 hover:brightness-90 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(30,30,30,0.8))',
                    backdropFilter: 'blur(1px)'
                  }}
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                {/* Rarity Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold border ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(nft.id);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-xl ${
                      userFavorites.has(nft.id)
                        ? 'bg-red-500/80 text-white'
                        : 'bg-black/50 text-gray-300 hover:text-red-400'
                    } transition-colors`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-full backdrop-blur-xl bg-black/50 text-gray-300 hover:text-blue-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="absolute bottom-3 left-3 flex space-x-2 text-xs text-white/80">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{nft.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{nft.likes}</span>
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white truncate flex-1">{nft.name}</h3>
                    <div className="text-right ml-2">
                      <div className="text-lg font-bold text-green-400">{nft.price} {nft.currency}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-400 truncate mb-2">{nft.collection}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{nft.description}</p>
                  
                  {/* Attributes Preview */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {nft.attributes.slice(0, 2).map((attr, idx) => (
                      <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                        {attr.trait_type}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedNFT(nft)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </button>
                  {nft.isListed && (
                    <button
                      onClick={() => buyNFT(nft)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg text-sm transition-all flex items-center justify-center space-x-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create NFT Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New NFT</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">NFT Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Enter NFT name..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Describe your NFT..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Price (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      placeholder="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400">
                      <option value="Art" className="bg-gray-800">Art</option>
                      <option value="Gaming" className="bg-gray-800">Gaming</option>
                      <option value="Music" className="bg-gray-800">Music</option>
                      <option value="Utility" className="bg-gray-800">Utility</option>
                      <option value="Collectibles" className="bg-gray-800">Collectibles</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Upload Image</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Drag and drop an image, or click to browse</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('NFT creation feature coming soon! This will mint your NFT on Base chain.');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Create NFT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                 {/* Image */}
                 <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/60">
                   <img 
                     src={selectedNFT.image} 
                     alt={selectedNFT.name}
                     className="w-full h-full object-cover filter brightness-75 contrast-125 saturate-75"
                     style={{
                       background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(30,30,30,0.8))',
                       backdropFilter: 'blur(1px)'
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>
                 </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedNFT.name}</h2>
                    <p className="text-purple-400 text-lg">{selectedNFT.collection}</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border mt-2 ${getRarityColor(selectedNFT.rarity)}`}>
                      {selectedNFT.rarity}
                    </div>
                  </div>

                  <p className="text-gray-300">{selectedNFT.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Current Price</div>
                      <div className="text-2xl font-bold text-green-400">{selectedNFT.price} {selectedNFT.currency}</div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Owner</div>
                      <div className="text-lg font-semibold text-white truncate">{selectedNFT.owner.slice(0, 10)}...</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNFT.attributes.map((attr, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                          <span className="text-gray-400">{attr.trait_type}</span>
                          <span className="text-white font-semibold">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedNFT.isListed && (
                    <button
                      onClick={() => buyNFT(selectedNFT)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Buy for {selectedNFT.price} {selectedNFT.currency}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 