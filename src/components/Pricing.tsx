'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Zap, 
  Star, 
  Gift, 
  TrendingUp, 
  Shield, 
  Rocket,
  CheckCircle,
  DollarSign,
  Trophy,
  Users,
  Target,
  BarChart3,
  Gem,
  Bot,
  MessageSquare
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  icon: React.ComponentType<any>;
  badge?: string;
  color: string;
  ethPrice: number; // Price in ETH
}

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Rainmaker Basic',
      price: 0,
      ethPrice: 0,
      period: 'Forever Free',
      description: 'Perfect for casual players getting started with crypto predictions',
      features: [
        '3 price predictions per day',
        'Basic leaderboard access',
        'Standard point rewards',
        'Discord & Telegram bot access',
        'Weekly community challenges',
        'Basic NFT marketplace browsing',
        'Standard customer support'
      ],
      icon: Star,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'pro',
      name: 'Rainmaker Pro',
      price: billingCycle === 'monthly' ? 29 : 299,
      ethPrice: billingCycle === 'monthly' ? 0.012 : 0.12,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Advanced features for serious crypto game show enthusiasts',
      features: [
        'Unlimited price predictions',
        'Premium leaderboard features',
        '3x point multipliers on wins',
        'Advanced analytics dashboard',
        'Priority Discord/Telegram support',
        'Early access to new games',
        'Exclusive NFT marketplace perks',
        'Real-time whale alert notifications',
        'Custom prediction strategies',
        'Monthly exclusive tournaments'
      ],
      highlight: true,
      icon: Zap,
      // badge: 'Most Popular',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'whale',
      name: 'Whale Master',
      price: billingCycle === 'monthly' ? 99 : 999,
      ethPrice: billingCycle === 'monthly' ? 0.04 : 0.4,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Ultimate package for crypto whales and professional traders',
      features: [
        'Everything in Rainmaker Pro',
        '10x point multipliers on wins',
        'Private whale hunting group access',
        'Personal AI trading assistant',
        'Exclusive whale-only tournaments',
        'Direct line to development team',
        'Custom NFT creation tools',
        'Advanced CDP wallet integration',
        'Professional market analysis',
        'VIP customer support (24/7)',
        'Revenue sharing opportunities',
        'Beta testing privileges'
      ],
      icon: Crown,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'Real-Time Price Predictions',
      description: 'Predict crypto prices using live CoinGecko data with 5-minute rounds'
    },
    {
      icon: Trophy,
      title: 'Weekly ETH Rewards',
      description: 'Automated ETH distributions to top performers via Coinbase CDP'
    },
    {
      icon: Users,
      title: 'Cross-Platform Gaming',
      description: 'Play on Web, Discord, or Telegram with unified profiles'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your performance with detailed statistics and insights'
    },
    {
      icon: Bot,
      title: 'AI-Powered Bots',
      description: 'Interactive Discord and Telegram bots with real-time notifications'
    },
    {
      icon: Gem,
      title: 'Base NFT Marketplace',
      description: 'Buy, sell, and create NFTs on the Base blockchain'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <DollarSign className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Rainmaker Arena Pricing
          </h1>
          <DollarSign className="w-8 h-8 text-green-400" />
        </motion.div>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Choose the perfect plan for your crypto gaming journey. All plans include our core features with increasing benefits and exclusive perks.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center space-x-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
          Monthly
        </span>
        <div className="relative">
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none"
          >
            <div
              className={`w-6 h-6 bg-green-400 rounded-full shadow-md transform transition-transform duration-300 ${
                billingCycle === 'yearly' ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
            Save 15%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105 ${
              plan.highlight
                ? 'bg-white/10 border-purple-400/50 shadow-xl shadow-purple-500/20'
                : 'bg-white/5 border-white/20 hover:border-white/40'
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                {plan.ethPrice > 0 && (
                  <div className="text-green-400 text-sm mt-1">
                    {plan.ethPrice} ETH {plan.period}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : plan.id === 'free'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              }`}>
                {plan.id === 'free' ? 'Get Started Free' : 'Subscribe Now'}
              </button>

              {plan.id !== 'free' && (
                <p className="text-center text-gray-400 text-xs mt-3">
                  7-day free trial • Cancel anytime
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">What Makes Rainmaker Arena Special?</h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Experience the future of crypto gaming with our innovative features and seamless cross-platform experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-6 hover:border-purple-400/50 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How do ETH rewards work?</h3>
            <p className="text-gray-400 text-sm">
              Our Coinbase CDP integration automatically distributes ETH to top performers weekly. The community pool grows with platform activity and subscription revenue.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Can I use all platforms with one subscription?</h3>
            <p className="text-gray-400 text-sm">
              Yes! Your subscription works across Web, Discord, and Telegram with a unified profile and shared progress tracking.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What blockchains do you support?</h3>
            <p className="text-gray-400 text-sm">
              We primarily focus on Base blockchain for NFTs and Ethereum mainnet for rewards, with plans to expand to more chains based on community demand.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How accurate are the price predictions?</h3>
            <p className="text-gray-400 text-sm">
              We use real-time CoinGecko API data for the most accurate and up-to-date cryptocurrency prices with 30-second update intervals.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30 p-12">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Rainmaker Arena?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Start your crypto gaming journey today with our free plan or unlock premium features with Pro and Whale Master tiers.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
            Start Free Trial
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg border border-white/20 transition-all duration-300">
            View Demo
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          No credit card required • 7-day free trial on all paid plans
        </p>
      </div>
    </div>
  );
}; 