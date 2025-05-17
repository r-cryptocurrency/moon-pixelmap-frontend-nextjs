'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';

interface WalletContextType {
  address: string | undefined;
  ensName: string | null | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  displayAddress: string;
}

// Default context with placeholder values
export const WalletContext = createContext<WalletContextType>({
  address: undefined,
  ensName: undefined,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: () => {},
  displayAddress: '',
});

// Dynamically import the actual provider
const DynamicWalletProvider = dynamic(
  () => import('./WalletProviderClient').then(mod => mod.WalletProviderClient),
  {
    ssr: false,
    loading: () => <div>Loading wallet connection...</div>
  }
);

// Simple wrapper that uses the dynamic import
export function WalletProvider({ children }: { children: ReactNode }) {
  return <DynamicWalletProvider>{children}</DynamicWalletProvider>;
}

export const useWallet = () => useContext(WalletContext);
