'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrumNova, arbitrum } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { ChatWebSocketProvider } from '@/context/ChatWebSocketContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Simple wagmi config without WalletConnect/Reown - just injected wallets (MetaMask, Brave, etc.)
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrumNova, arbitrum],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrumNova.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ChatWebSocketProvider>
            {children}
          </ChatWebSocketProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
