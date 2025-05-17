'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { chains as configuredChains, projectId as staticProjectId, staticMetadata as configMetadata } from '../config/web3modalConfig';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import * as reownAppkitNetworks from '@reown/appkit/networks';

const WagmiAndWeb3ModalSetup = dynamic(
  () => import('@/components/WagmiAndWeb3ModalSetup'),
  {
    ssr: false,
    loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Loading wallet providers...</p></div>,
  }
);

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [wagmiAdapterInstance, setWagmiAdapterInstance] = useState<WagmiAdapter | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !wagmiAdapterInstance && typeof window !== 'undefined') {
      if (!staticProjectId) {
        console.error('CRITICAL: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Reown AppKit will not function.');
        return;
      }

      let resolvedReownNetworks = configuredChains.map(chain => {
        // Attempt to map by chain ID first, then by a normalized name
        if (chain.id === 1 && reownAppkitNetworks.mainnet) return reownAppkitNetworks.mainnet;
        if (chain.id === 11155111 && reownAppkitNetworks.sepolia) return reownAppkitNetworks.sepolia;
        if (chain.id === 137 && reownAppkitNetworks.polygon) return reownAppkitNetworks.polygon;
        // Add other direct ID mappings as needed

        const networkName = chain.name.toLowerCase().replace(/ /g, '');
        // @ts-ignore
        const reownNetwork = reownAppkitNetworks[networkName];
        if (!reownNetwork) {
          console.warn(`Reown AppKit network not found for chain name: ${chain.name} (normalized: ${networkName}).`);
        }
        return reownNetwork;
      }).filter(Boolean);

      if (resolvedReownNetworks.length === 0) {
        console.warn("No valid Reown AppKit networks could be mapped from configuredChains. Falling back to Mainnet and Sepolia.");
        resolvedReownNetworks = [reownAppkitNetworks.mainnet, reownAppkitNetworks.sepolia].filter(Boolean);
      }
      // Ensure it's not empty before passing to adapter
      if (resolvedReownNetworks.length === 0) {
        console.error("CRITICAL: No Reown AppKit networks available (mainnet or sepolia not found in imports?). AppKit cannot initialize.");
        return;
      }
      
      console.log("Providers.tsx: Creating WagmiAdapter with networks:", resolvedReownNetworks, "and projectId:", staticProjectId);
      const adapter = new WagmiAdapter({
        // @ts-ignore 
        networks: resolvedReownNetworks, // Reown expects [Network, ...Network[]]
        projectId: staticProjectId,
        storage: createStorage({
          storage: cookieStorage,
          key: 'moonpixelmap.reown.wagmi.v1',
        }),
      });
      setWagmiAdapterInstance(adapter);

      // Dynamically set metadata URL based on current window origin
      const currentOrigin = window.location.origin;
      const dynamicMetadata = {
        ...configMetadata, // Spread original metadata
        url: currentOrigin,
        icons: [`${currentOrigin}/logo_w_text.png`], // Assuming logo is at the root
      };
      console.log("Providers.tsx: Initializing AppKit with dynamic metadata URL:", dynamicMetadata.url);

      createAppKit({
        adapters: [adapter],
        // @ts-ignore
        networks: resolvedReownNetworks, // Reown expects [Network, ...Network[]]
        projectId: staticProjectId,
        metadata: dynamicMetadata, // Use dynamically generated metadata
        features: {
          analytics: true,
        },
        termsConditionsUrl: `${dynamicMetadata.url}/terms`, // Use dynamic URL
        privacyPolicyUrl: `${dynamicMetadata.url}/privacy`, // Use dynamic URL
        themeVariables: {
            // @ts-ignore
          '--w3m-z-index': 5000,
        },
      });
      console.log("🟢 Reown AppKit initialized successfully in Providers useEffect");
    }
  }, [mounted, wagmiAdapterInstance]);

  if (!mounted || !wagmiAdapterInstance) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Initializing AppKit...</p></div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiAndWeb3ModalSetup wagmiAdapter={wagmiAdapterInstance}>
        {children}
      </WagmiAndWeb3ModalSetup>
    </ThemeProvider>
  );
}
