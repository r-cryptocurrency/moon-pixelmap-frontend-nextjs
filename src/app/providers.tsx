'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit, type AppKit } from '@reown/appkit';
import { PropsWithChildren, useEffect, useState, createContext, useContext } from 'react';
import { WagmiProvider, type Config as WagmiConfigType } from 'wagmi';
import { arbitrum, mainnet, sepolia, arbitrumNova } from '@reown/appkit/networks';
import { ChatWebSocketProvider } from '@/context/ChatWebSocketContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// This is a placeholder. Replace with your actual Reown Cloud Project ID.
const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'df1b891a13cb85a1964bcde7a4aba713';

// Define reownNetworks as a mutable tuple that is guaranteed to be non-empty.
// The elements are of the types imported from @reown/appkit/networks.
// This structure should satisfy both AppKitNetwork[] and [AppKitNetwork, ...AppKitNetwork[]]
const reownNetworks: [typeof mainnet, ...(typeof mainnet | typeof sepolia | typeof arbitrum | typeof arbitrumNova)[]] = 
  [mainnet, sepolia, arbitrumNova, arbitrum];

// Module-level variables to store instances once created
let appKitInstanceInternal: AppKit | null = null;
let wagmiConfigInstanceInternal: WagmiConfigType | null = null;

// Create a context for AppKit
const AppKitContext = createContext<AppKit | null>(null);

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!REOWN_PROJECT_ID || REOWN_PROJECT_ID === 'YOUR_REOWN_CLOUD_PROJECT_ID') {
      console.error(
        'Reown Project ID is not configured. \n' +
        'Please set the NEXT_PUBLIC_REOWN_PROJECT_ID environment variable in your .env.local file, \n' +
        'or update the placeholder directly in /src/app/providers.tsx. \n' +
        'You can obtain a Project ID from https://cloud.reown.com/'
      );
      // Consider setting an error state here to display a user-friendly message
      return;
    }

    try {
      const origin = window.location.origin;
      const metadata = {
        name: 'Moon Pixel Map',
        description: 'Moon Pixel Map Frontend',
        url: origin,
        icons: [`${origin}/favicon.ico`],
      };

      const wagmiAdapter = new WagmiAdapter({
        networks: reownNetworks,
        projectId: REOWN_PROJECT_ID,
        ssr: true, // Important for Next.js
      });
      wagmiConfigInstanceInternal = wagmiAdapter.wagmiConfig;

      const newAppKit = createAppKit({
        adapters: [wagmiAdapter],
        networks: reownNetworks,
        projectId: REOWN_PROJECT_ID,
        metadata,
        // features: {
        //   analytics: true // Optional - defaults to your Cloud configuration
        // }
      });
      appKitInstanceInternal = newAppKit;
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Web3 providers:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
    }

  }, []); // Empty dependency array ensures it runs once on mount

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-orange-400 text-white p-4">
        <div className="text-center bg-black/30 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Initialization Error</h2>
          <p className="text-sm">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!REOWN_PROJECT_ID || REOWN_PROJECT_ID === 'YOUR_REOWN_CLOUD_PROJECT_ID') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>Reown Project ID is not configured.</p>
          <p className="text-sm mt-2">Please set NEXT_PUBLIC_REOWN_PROJECT_ID in .env.local</p>
          <a href="https://cloud.reown.com" className="text-blue-600 underline mt-2 block">Get a Project ID</a>
        </div>
      </div>
    );
  }

  // Render children only after initialization is complete and instances are available
  if (!isInitialized || !wagmiConfigInstanceInternal || !appKitInstanceInternal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-orange-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Web3 Providers...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppKitContext.Provider value={appKitInstanceInternal}>
        <WagmiProvider config={wagmiConfigInstanceInternal}>
          <QueryClientProvider client={queryClient}>
            <ChatWebSocketProvider>
              {children}
            </ChatWebSocketProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </AppKitContext.Provider>
    </ErrorBoundary>
  );
}

// Custom hook to access AppKit from context
export const useAppKitContext = () => {
  const context = useContext(AppKitContext);
  // Return null instead of throwing - allows use before initialization
  // Callers should check for null before using
  return context;
};
