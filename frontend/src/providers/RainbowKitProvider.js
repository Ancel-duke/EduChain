import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define localhost chain for Hardhat
const localhost = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Local',
      url: '',
    },
  },
});

// Configure supported chains
const chains = [localhost, sepolia, mainnet];

// Configure wallets - use injectedWallet (doesn't require MetaMask SDK)
const { connectors } = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet, // Uses window.ethereum directly, no SDK needed
      ],
    },
  ],
  {
    appName: 'EduChain',
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'educhain-app',
  }
);

// Create wagmi config
const config = createConfig({
  chains,
  connectors,
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false,
});

// Query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function RainbowKitWrapper({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
