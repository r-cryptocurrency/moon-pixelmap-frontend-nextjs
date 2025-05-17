'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import React, { ReactNode, useEffect } from 'react';
import { projectId, staticMetadata } from '../config/web3modalConfig'; // Changed metadata to staticMetadata

// Define the expected type for wagmiConfig prop
interface Web3ModalProviderProps {
  children: ReactNode;
  wagmiConfig: any; // Replace 'any' with the actual WagmiConfig type if available and easily importable
}

export default function Web3ModalProvider({ children, wagmiConfig }: Web3ModalProviderProps) {
  useEffect(() => {
    // console.log('Web3ModalProvider: useEffect triggered. wagmiConfig received:', wagmiConfig ? 'Exists' : 'Null');
    if (typeof window !== 'undefined' && wagmiConfig) { // Ensure wagmiConfig is present
      // @ts-ignore
      if (!window.__web3ModalInitialized) {
        if (!projectId) {
          console.error('❌ Web3ModalProvider: projectId is missing. Modal will not be created.');
        } else {
          console.log('🌐 Attempting to initialize Web3Modal with project ID:', projectId, 'and wagmiConfig');
          try {
            createWeb3Modal({
              wagmiConfig: wagmiConfig, // Use the wagmiConfig from props
              projectId: projectId!,
              enableAnalytics: true,
              featuredWalletIds: [
                'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
                'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Coinbase Wallet
                '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
                'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef', // Rainbow
              ],
              termsConditionsUrl: staticMetadata.url + '/terms', // Use staticMetadata
              privacyPolicyUrl: staticMetadata.url + '/privacy', // Use staticMetadata
              themeVariables: {
                '--w3m-z-index': 5000,
              },
            });
            console.log('🟢 Web3Modal initialized successfully using @web3modal/wagmi/react');
            // @ts-ignore
            window.__web3ModalInitialized = true;
          } catch (error) {
            console.error('🔴 Error initializing Web3Modal:', error);
          }
        }
      } else {
        // console.log('ℹ️ Web3Modal already initialized, skipping re-initialization.');
      }
    }
  }, [wagmiConfig]); // Re-run effect if wagmiConfig changes (though it shouldn't after initial setup)

  return <>{children}</>;
}
