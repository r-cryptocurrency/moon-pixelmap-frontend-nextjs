'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { ClientOnly } from '../components/ClientOnly';

// Create wagmi config for Ethereum mainnet
const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http()
  },
});

// Client-side only wrapper for Web3Modal
const Web3ModalProvider = ({ 
  children, 
  queryClient 
}: { 
  children: React.ReactNode,
  queryClient: QueryClient
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ClientOnly>
      <Web3ModalProvider queryClient={queryClient}>
        {children}
      </Web3ModalProvider>
    </ClientOnly>
  );
}