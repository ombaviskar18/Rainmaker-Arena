'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useBalance } from 'wagmi';
import { 
  Home, 
  Trophy, 
  Gift, 
  User, 
  Wallet, 
  Menu, 
  X,
  CreditCard,
  Zap,
  Gem
} from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'leaderboard' | 'nft' | 'rewards' | 'pricing' | 'account';
  onPageChange: (page: 'home' | 'leaderboard' | 'nft' | 'rewards' | 'pricing' | 'account') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onPageChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'nft', label: 'NFT Marketplace', icon: Gem },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: any) => {
    if (!bal) return '0.00';
    return parseFloat(bal.formatted).toFixed(4);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex items-center justify-between px-8 py-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
        {/* Logo */}
        <motion.button 
          onClick={() => onPageChange('home')}
          className="flex items-center space-x-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/rainlogo.png" alt="Rainmaker Arena" className="w-10 h-10 rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Rainmaker Arena
            </h1>
            <p className="text-xs text-gray-400">Price Prediction Game Show</p>
          </div>
        </motion.button>

        {/* Navigation Items */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onPageChange(item.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <div className="flex items-center space-x-3 px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30 text-green-400">
              <Wallet className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">{formatAddress(address!)}</div>
                <div className="text-xs text-green-300">
                  {formatBalance(balance)} ETH
                </div>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => open()}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </motion.button>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-white/5 border-b border-white/10">
        {/* Mobile Logo */}
        <motion.button 
          onClick={() => onPageChange('home')}
          className="flex items-center space-x-2 cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/rainlogo.png" alt="Rainmaker Arena" className="w-8 h-8 rounded-lg" />
          </div>
          <span className="font-bold text-white">Rainmaker Arena</span>
        </motion.button>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white"
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden backdrop-blur-xl bg-white/5 border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Navigation Items */}
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              ))}

              <hr className="border-white/20 my-4" />

              {/* Wallet Section */}
              {isConnected ? (
                <div className="px-4 py-3 bg-green-500/20 rounded-lg border border-green-400/30">
                  <div className="text-green-400 font-semibold text-sm">
                    {formatAddress(address!)}
                  </div>
                  <div className="text-green-300 text-xs">
                    {formatBalance(balance)} ETH
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Go to Account page for more options
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    open();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold"
                  whileTap={{ scale: 0.95 }}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 