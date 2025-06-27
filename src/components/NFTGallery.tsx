'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Heart, 
  Share2, 
  Grid, 
  List,
  Trophy,
  Gem,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAccount } from 'wagmi';

// Alchemy API configuration
const ALCHEMY_API_KEY = 'x2fFyeL-BONypwQZ6fc1DyhRnghyCow5';
const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/v2';

interface NFTMetadata {
  tokenId: string;
  contract: {
    address: string;
    name: string;
    symbol: string;
    totalSupply?: string;
  };
  title: string;
  description: string;
  image: {
    originalUrl: string;
    thumbnailUrl: string;
  };
  raw: {
    metadata: any;
    error?: string;
  };
  collection?: {
    name: string;
    slug: string;
    externalUrl?: string;
  };
  mint?: {
    mintAddress: string;
    blockNumber: number;
    timestamp: string;
  };
  timeLastUpdated: string;
  floorPrice?: {
    value: number;
    currency: string;
  };
}

interface NFTCollection {
  contractAddress: string;
  name: string;
  totalSupply: number;
  floorPrice?: number;
  nfts: NFTMetadata[];
}

export const NFTGallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'price'>('recent');
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs(address);
    }
  }, [address, isConnected]);

  const fetchUserNFTs = async (walletAddress: string) => {
    setLoading(true);
    try {
      console.log('🖼️ Fetching NFTs for address:', walletAddress);

      const response = await fetch(
        `${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}/getNFTs?owner=${walletAddress}&withMetadata=true&pageSize=100`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ownedNfts && data.ownedNfts.length > 0) {
        const processedNFTs = await processNFTData(data.ownedNfts);
        setNfts(processedNFTs);
        
        // Group by collections
        const collectionsMap = new Map<string, NFTCollection>();
        
        processedNFTs.forEach(nft => {
          const contractAddress = nft.contract.address;
          
          if (!collectionsMap.has(contractAddress)) {
            collectionsMap.set(contractAddress, {
              contractAddress,
              name: nft.contract.name || 'Unknown Collection',
              totalSupply: parseInt(nft.contract.totalSupply || '0'),
              nfts: []
            });
          }
          
          collectionsMap.get(contractAddress)!.nfts.push(nft);
        });

        setCollections(Array.from(collectionsMap.values()));
        
        // Fetch floor prices for collections
        await fetchFloorPrices(Array.from(collectionsMap.keys()));
        
        console.log(`✅ Loaded ${processedNFTs.length} NFTs from ${collectionsMap.size} collections`);
      } else {
        setNfts([]);
        setCollections([]);
        console.log('📭 No NFTs found for this address');
      }
      
    } catch (error) {
      console.error('❌ Error fetching NFTs:', error);
      setNfts([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const processNFTData = async (rawNFTs: any[]): Promise<NFTMetadata[]> => {
    return rawNFTs.map(nft => {
      // Extract image URL, handling IPFS and other formats
      let imageUrl = nft.metadata?.image || nft.media?.[0]?.gateway || '';
      
      // Convert IPFS URLs to HTTP gateway URLs
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      return {
        tokenId: nft.id?.tokenId || 'unknown',
        contract: {
          address: nft.contract?.address || '',
          name: nft.contractMetadata?.name || nft.contract?.name || 'Unknown',
          symbol: nft.contractMetadata?.symbol || '',
          totalSupply: nft.contractMetadata?.totalSupply
        },
        title: nft.metadata?.name || nft.title || `#${nft.id?.tokenId}`,
        description: nft.metadata?.description || nft.description || '',
        image: {
          originalUrl: imageUrl,
          thumbnailUrl: imageUrl
        },
        raw: {
          metadata: nft.metadata,
          error: nft.error
        },
        collection: {
          name: nft.contractMetadata?.name || 'Unknown Collection',
          slug: nft.contract?.address?.toLowerCase() || '',
          externalUrl: nft.contractMetadata?.externalUrl
        },
        timeLastUpdated: nft.timeLastUpdated || new Date().toISOString()
      };
    });
  };

  const fetchFloorPrices = async (contractAddresses: string[]) => {
    // In a real implementation, you'd fetch floor prices from OpenSea or another marketplace API
    // For demo purposes, we'll use mock data
    const mockFloorPrices: Record<string, number> = {
      '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': 15.5, // BAYC
      '0x60e4d786628fea6478f785a6d7e704777c86a7c6': 5.2,  // MAYC
      '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e': 0.8,  // Doodles
    };

    // Update collections with floor prices
    setCollections(prev => prev.map(collection => ({
      ...collection,
      floorPrice: mockFloorPrices[collection.contractAddress.toLowerCase()] || undefined
    })));
  };

  const filteredNFTs = nfts
    .filter(nft => {
      const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nft.collection?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = selectedCollection === 'all' || 
                              nft.contract.address === selectedCollection;
      return matchesSearch && matchesCollection;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price':
          // Sort by floor price if available
          const aPrice = collections.find(c => c.contractAddress === a.contract.address)?.floorPrice || 0;
          const bPrice = collections.find(c => c.contractAddress === b.contract.address)?.floorPrice || 0;
          return bPrice - aPrice;
        case 'recent':
        default:
          return new Date(b.timeLastUpdated).getTime() - new Date(a.timeLastUpdated).getTime();
      }
    });

  const toggleFavorite = (nftId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(nftId)) {
        newFavorites.delete(nftId);
      } else {
        newFavorites.add(nftId);
      }
      return newFavorites;
    });
  };

  const openNFTDetails = (nft: NFTMetadata) => {
    setSelectedNFT(nft);
  };

  const closeNFTDetails = () => {
    setSelectedNFT(null);
  };

  const shareNFT = (nft: NFTMetadata) => {
    if (navigator.share) {
      navigator.share({
        title: nft.title,
        text: `Check out this NFT: ${nft.title}`,
        url: `https://opensea.io/assets/${nft.contract.address}/${nft.tokenId}`
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`https://opensea.io/assets/${nft.contract.address}/${nft.tokenId}`);
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
              NFT Gallery
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect your wallet to view your NFT collection and participate in NFT-powered games!
            </p>
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-400/30">
              <span>⚠️</span>
              <span className="font-semibold">Connect your wallet to get started!</span>
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
            NFT Gallery
          </h1>
          <Gem className="w-8 h-8 text-purple-400" />
        </motion.div>
        <p className="text-gray-400 text-lg">
          Your digital asset collection powered by Alchemy
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{nfts.length}</div>
          <div className="text-sm text-gray-400">Total NFTs</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{collections.length}</div>
          <div className="text-sm text-gray-400">Collections</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{favorites.size}</div>
          <div className="text-sm text-gray-400">Favorites</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {collections.reduce((sum, c) => sum + (c.floorPrice || 0), 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Est. Value (ETH)</div>
        </div>
      </div>

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search NFTs or collections..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <select
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
            >
              <option value="all">All Collections</option>
              {collections.map(collection => (
                <option key={collection.contractAddress} value={collection.contractAddress}>
                  {collection.name} ({collection.nfts.length})
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
              <option value="price">Floor Price</option>
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-purple-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your NFT collection...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && nfts.length === 0 && (
        <div className="text-center py-20">
          <Gem className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
          <p className="text-gray-400">
            {searchTerm || selectedCollection !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'This wallet doesn\'t have any NFTs yet'}
          </p>
        </div>
      )}

      {/* NFT Grid/List */}
      {!loading && filteredNFTs.length > 0 && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredNFTs.map((nft, index) => (
            <motion.div
              key={`${nft.contract.address}-${nft.tokenId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => openNFTDetails(nft)}
            >
              {/* Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'aspect-square'} overflow-hidden`}>
                {nft.image.originalUrl ? (
                  <img
                    src={nft.image.originalUrl}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-nft.png'; // Fallback image
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Gem className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(`${nft.contract.address}-${nft.tokenId}`);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-xl ${
                      favorites.has(`${nft.contract.address}-${nft.tokenId}`)
                        ? 'bg-red-500/80 text-white'
                        : 'bg-black/50 text-gray-300 hover:text-red-400'
                    } transition-colors`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareNFT(nft);
                    }}
                    className="p-1.5 rounded-full backdrop-blur-xl bg-black/50 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                <div>
                  <h3 className="font-semibold text-white truncate">{nft.title}</h3>
                  <p className="text-sm text-purple-400 truncate">{nft.collection?.name}</p>
                  {nft.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{nft.description}</p>
                  )}
                </div>

                {viewMode === 'list' && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">
                      Token #{nft.tokenId}
                    </div>
                    <div className="flex items-center space-x-2">
                      {collections.find(c => c.contractAddress === nft.contract.address)?.floorPrice && (
                        <span className="text-sm text-green-400">
                          {collections.find(c => c.contractAddress === nft.contract.address)?.floorPrice} ETH
                        </span>
                      )}
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeNFTDetails}
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
                <div className="aspect-square rounded-lg overflow-hidden">
                  {selectedNFT.image.originalUrl ? (
                    <img
                      src={selectedNFT.image.originalUrl}
                      alt={selectedNFT.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <Gem className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedNFT.title}</h2>
                    <p className="text-purple-400 text-lg">{selectedNFT.collection?.name}</p>
                  </div>

                  {selectedNFT.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300">{selectedNFT.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Token ID</div>
                      <div className="text-lg font-semibold text-white">#{selectedNFT.tokenId}</div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Contract</div>
                      <div className="text-lg font-semibold text-white truncate">
                        {selectedNFT.contract.address.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.open(`https://opensea.io/assets/${selectedNFT.contract.address}/${selectedNFT.tokenId}`, '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>View on OpenSea</span>
                    </button>
                    <button
                      onClick={() => shareNFT(selectedNFT)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={closeNFTDetails}
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