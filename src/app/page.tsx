'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import PixelMapArea from '@/components/PixelMapArea';
import StatusPanel  from '@/components/StatusPanel';
import ChatDisplay  from '@/components/ChatDisplay';
import ChatInput    from '@/components/ChatInput';

export default function Home() {
  const [selectedPixel, setSelectedPixel] = useState<{x: number, y: number} | undefined>();
  const { isConnected, address } = useAccount();
  
  const handlePixelSelect = (x: number, y: number) => {
    setSelectedPixel({ x, y });
    console.log(`Selected pixel at (${x}, ${y})`);
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-2 md:p-4 h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] mx-auto w-full max-w-[1800px] overflow-hidden">
      <PixelMapArea 
        className="col-span-2 h-full max-h-full overflow-hidden" 
        onPixelSelect={handlePixelSelect} 
      />
      <div className="col-start-3 h-full max-h-full grid grid-rows-[minmax(220px,auto)_1fr_auto] gap-1 overflow-hidden">
        <StatusPanel
          className="row-start-1 overflow-y-auto"
          selectedPixel={selectedPixel}
        />
        <ChatDisplay className="row-start-2 overflow-y-auto min-h-[100px]" />
        <ChatInput className="row-start-3" />
      </div>
    </div>
  );
}
