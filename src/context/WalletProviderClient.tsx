'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

// Import the context from the main file
import { WalletContext } from './WalletContext';

/**
 * Client-side implementation of the Wallet Provider
 * This component is dynamically imported to ensure it only runs on the client
 */
export function WalletProviderClient({ children }: { children: ReactNode }) {
  // Component state
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Reown AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { disconnect: disconnectWallet } = useDisconnect();

  // Format address for display (e.g., 0x1234...5678)
  const displayAddress = address 
    ? ensName || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  // Handle connection
  const connect = async () => {
    try {
      console.log('🔵 Connecting wallet - starting connection process...');
      setIsConnecting(true);
      
      // First check if window.ethereum exists (injected wallet like MetaMask)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        console.log('📱 Detected injected provider (MetaMask, etc)');
      }
      
      // Clear any existing connection data if needed
      if (localStorage.getItem('wagmi.connected') === 'true' && !isConnected) {
        console.log('🧹 Found stale connection, cleaning up...');
        localStorage.removeItem('wagmi.connected');
      }
      
      // Open the Reown AppKit modal
      console.log('🔓 Opening Reown AppKit modal...');
      await open();
      console.log('🟢 Reown AppKit modal action initiated');
    } catch (error) {
      console.error('🔴 Error during connect process:', error);
      alert('There was an error connecting to your wallet. Please try again or use a different wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnection
  const disconnect = () => {
    disconnectWallet();
  };

  // Save user data to the backend when connected
  useEffect(() => {
    const saveUserData = async () => {
      if (isConnected && address) {
        try {
          // Import here to avoid circular dependencies
          const { saveUserData } = await import('@/services/userApi');
          
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

    saveUserData();
  }, [isConnected, address, ensName]);

  return (
    <WalletContext.Provider value={{
      address,
      ensName,
      isConnected,
      isConnecting,
      connect,
      disconnect,
      displayAddress,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
