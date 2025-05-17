'use client';

import { WagmiProvider, type Config as WagmiConfigType } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useState, useEffect } from 'react';
import { projectId, staticMetadata, chains as configuredChains } from '../config/web3modalConfig';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'; // New import for Reown AppKit

const queryClient = new QueryClient();

interface WagmiAndWeb3ModalSetupProps {
  children: ReactNode;
  wagmiAdapter: WagmiAdapter | null; // Pass adapter as a prop
}

export default function WagmiAndWeb3ModalSetup({ children, wagmiAdapter }: WagmiAndWeb3ModalSetupProps) {
  const [clientWagmiConfig, setClientWagmiConfig] = useState<WagmiConfigType | null>(null);

  useEffect(() => {
    if (wagmiAdapter) {
      console.log("WagmiAndWeb3ModalSetup: Using wagmiConfig from wagmiAdapter.");
      setClientWagmiConfig(wagmiAdapter.wagmiConfig);
    } else {
      console.warn("WagmiAndWeb3ModalSetup: wagmiAdapter is null. Cannot set wagmiConfig.");
    }
  }, [wagmiAdapter]); // Re-run if wagmiAdapter changes

  if (!clientWagmiConfig) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Initializing Wallet Connection...</p></div>;
  }

  return (
    <WagmiProvider config={clientWagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {children} 
      </QueryClientProvider>
    </WagmiProvider>
  );
}
