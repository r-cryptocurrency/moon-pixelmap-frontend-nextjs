'use client';

import { Web3Provider } from '@/context/Web3Provider';
import { WalletProvider } from '@/context/WalletContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </Web3Provider>
  );
}
