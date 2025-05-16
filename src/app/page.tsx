'use client';

import { useState } from 'react';
import PixelMapArea from '@/components/PixelMapArea';
import StatusPanel  from '@/components/StatusPanel';
import ChatDisplay  from '@/components/ChatDisplay';
import ChatInput    from '@/components/ChatInput';

export default function Home() {
  const [selectedPixel, setSelectedPixel] = useState<{x: number, y: number} | undefined>();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  const handlePixelSelect = (x: number, y: number) => {
    setSelectedPixel({ x, y });
    console.log(`Selected pixel at (${x}, ${y})`);
  };
  
  // TODO: Implement wallet connection functionality
  const connectWallet = async () => {
    // This will be implemented later with ethers.js or similar
    console.log('Connect wallet functionality coming soon');
    setIsWalletConnected(true);
    setWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'); // Example address
  };

  return (
    <div className="grid grid-cols-3 gap-8 p-8 h-[calc(100vh-8rem)] mx-auto w-full max-w-[1800px]">
      <PixelMapArea 
        className="col-span-2 h-full" 
        onPixelSelect={handlePixelSelect} 
      />
      <div className="col-start-3 h-full grid grid-rows-[auto_1fr_auto] gap-6">
        <StatusPanel
          className="row-start-1"
          selectedPixel={selectedPixel}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          onConnectWallet={connectWallet}
        />
        <ChatDisplay className="row-start-2 overflow-y-auto min-h-[200px]" />
        <ChatInput className="row-start-3" />
      </div>
    </div>
  );
}
