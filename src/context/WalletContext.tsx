'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { ClientOnly } from '../components/ClientOnly';

interface WalletContextType {
  address: string | null;
  ensName: string | null;
  displayAddress: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  ensName: null,
  displayAddress: null,
  isConnected: false,
  connect: async () => {},
  disconnect: async () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected, connector } = useAccount();
  const { data: ensName } = useEnsName({ address });
  
  // Format the address for display (ENS or shortened address)
  const displayAddress = ensName || (address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : null);

  // Connect wallet function
  const connect = async () => {
    try {
      if (connector) {
        await connector.connect();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Disconnect wallet function
  const disconnect = async () => {
    try {
      if (connector) {
        await connector.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };
  
  // When user connects wallet, save their data to our database
  useEffect(() => {
    const saveUserData = async () => {
      if (isConnected && address) {
        try {
          const { saveUserData } = await import('../services/userApi');
          await saveUserData({
            address,
            ensName: ensName || null,
            lastConnected: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      saveUserData();
    }
  }, [isConnected, address, ensName]);

  const contextValue = {
    address: address || null,
    ensName: ensName || null,
    displayAddress,
    isConnected: isConnected || false,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      <ClientOnly>
        {children}
      </ClientOnly>
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);