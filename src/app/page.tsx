'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import PixelMapArea from '@/components/PixelMapArea';
import StatusPanel  from '@/components/StatusPanel';
import UpdatePixelPanel from '@/components/UpdatePixelPanel';
import ChatDisplay  from '@/components/ChatDisplay';
import ChatInput    from '@/components/ChatInput';

export default function Home() {
  const [selectedPixel, setSelectedPixel] = useState<{x: number, y: number} | undefined>();
  const [selectedPixels, setSelectedPixels] = useState<{ x: number; y: number }[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const handlePixelSelect = (x: number, y: number) => {
    setSelectedPixel({ x, y });
    setSelectedPixels([{ x, y }]);
    console.log(`Selected pixel at (${x}, ${y})`);
  };

  const handleAreaSelect = (pixels: { x: number; y: number }[]) => {
    setSelectedPixels(pixels);
    console.log(`Selected ${pixels.length} pixels`);
  };

  const handleClearSelection = () => {
    setSelectedPixels([]);
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-2 md:p-4 h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] mx-auto w-full max-w-[1800px] overflow-hidden">
      <PixelMapArea 
        className="col-span-2 h-full max-h-full overflow-hidden" 
        onPixelSelect={handlePixelSelect}
        onAreaSelect={handleAreaSelect}
        selectionMode={selectionMode}
      />
      <div className="col-start-3 h-full max-h-full grid grid-rows-[auto_auto_auto_1fr_auto] gap-1 overflow-hidden">
        {/* Map Control Panel */}
        <div className="row-start-1 panel p-3">
          <h3 className="text-xs font-bold mb-2 text-gray-700 dark:text-gray-300">MAP CONTROLS</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectionMode(false)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                !selectionMode
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Click pixels individually and pan/zoom the map"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">👆</span>
                <span>Single Pixel + Pan</span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectionMode(true)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectionMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-200 text-blue-900 hover:bg-blue-300'
              }`}
              title="Drag to select multiple pixels for batch update"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">⬚</span>
                <span>Multi-Select Mode</span>
              </span>
            </button>
            
            {selectionMode && (
              <div className="text-xs text-center text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                Drag on map to select area
              </div>
            )}
          </div>
        </div>
        
        <StatusPanel
          className="row-start-2 overflow-y-auto"
          selectedPixel={selectedPixel}
        />
        
        <UpdatePixelPanel
          className="row-start-3 overflow-y-auto"
          selectedPixels={selectedPixels}
          onClose={handleClearSelection}
        />
        
        <ChatDisplay className="row-start-4 overflow-y-auto min-h-[60px]" />
        <ChatInput className="row-start-5" />
      </div>
    </div>
  );
}
