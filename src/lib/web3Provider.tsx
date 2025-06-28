'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { mainnet, base, polygon } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { useEffect, useState } from 'react';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Your WalletConnect Cloud project ID - with fallback for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f5a6c8d9e0b1c2d3e4f5a6b7c8d9e0f';

// Check if projectId is available
if (!projectId) {
  console.error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for wallet connection');
} else {
  console.log('✅ WalletConnect Project ID configured successfully');
}

// 2. Create wagmiConfig
const metadata = {
  name: 'Rainmaker Arena',
  description: 'Interactive Crypto Game Show Platform',
  url: 'https://rainmaker-arena.vercel.app', // origin must match your domain & subdomain
  icons: ['/rainlogo.png']
};

const config = createConfig({
  chains: [mainnet, base, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    walletConnect({ 
      projectId, 
      metadata, 
      showQrModal: false 
    }),
    injected({ 
      shimDisconnect: true 
    }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
});

// 3. Create modal with improved configuration - only on client side
let web3ModalInitialized = false;

function initializeWeb3Modal() {
  if (typeof window === 'undefined' || web3ModalInitialized) return;
  
  try {
    createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: true,
      enableOnramp: true,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#8b5cf6', // Purple theme for Rainmaker
        '--w3m-color-mix-strength': 40,
        '--w3m-accent': '#8b5cf6',
        '--w3m-border-radius-master': '12px',
      },
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      ],
    });
    web3ModalInitialized = true;
    console.log('✅ Web3Modal initialized successfully');
  } catch (error) {
    console.error('❌ Web3Modal initialization failed:', error);
  }
}

export function Web3ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeWeb3Modal();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
} 