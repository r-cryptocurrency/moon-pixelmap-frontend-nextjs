'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit, type AppKit } from '@reown/appkit';
import { PropsWithChildren, useEffect, useState, createContext, useContext } from 'react';
import { WagmiProvider, type Config as WagmiConfigType } from 'wagmi';
import { arbitrum, mainnet, sepolia, arbitrumNova } from '@reown/appkit/networks';

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

  }, []); // Empty dependency array ensures it runs once on mount

  if (!REOWN_PROJECT_ID || REOWN_PROJECT_ID === 'YOUR_REOWN_CLOUD_PROJECT_ID') {
    return (
      <div>
        Error: Reown Project ID is not configured. Please set the NEXT_PUBLIC_REOWN_PROJECT_ID 
        environment variable in your .env.local file. Get a Project ID from cloud.reown.com.
      </div>
    );
  }

  // Render children only after initialization is complete and instances are available
  if (!isInitialized || !wagmiConfigInstanceInternal || !appKitInstanceInternal) {
    return <div>Loading Web3 Providers...</div>;
  }

  return (
    <AppKitContext.Provider value={appKitInstanceInternal}>
      <WagmiProvider config={wagmiConfigInstanceInternal}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </AppKitContext.Provider>
  );
}

// Custom hook to access AppKit from context
export const useAppKitContext = () => {
  const context = useContext(AppKitContext);
  if (!context) {
    // This error implies that the hook is used outside of AppKitContext.Provider,
    // or before the provider has received the appKitInstanceInternal value (i.e., before initialization).
    throw new Error('useAppKitContext must be used within Providers, and after AppKit has been initialized.');
  }
  return context;
};
