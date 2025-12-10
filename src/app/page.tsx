'use client';

import { useState } from 'react';
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
  };

  const handleAreaSelect = (pixels: { x: number; y: number }[]) => {
    setSelectedPixels(pixels);
  };

  const handleClearSelection = () => {
    setSelectedPixels([]);
  };

  return (
    <div className="main-layout">
      {/* Main pixel map - full width on mobile, takes remaining space on desktop */}
      <div className="map-container">
        <PixelMapArea 
          className="w-full h-full overflow-hidden" 
          onPixelSelect={handlePixelSelect}
          onAreaSelect={handleAreaSelect}
          selectionMode={selectionMode}
        />
      </div>
      
      {/* Side panel - stacks below on mobile, fixed width on desktop */}
      <div className="side-panel">
        {/* Map Control Panel */}
        <div className="panel p-2 md:p-3">
          <h3 className="text-[10px] md:text-xs font-bold mb-1 md:mb-2 text-gray-700 dark:text-gray-300">MAP CONTROLS</h3>
          <div className="flex flex-row gap-1 md:gap-2">
            <button
              onClick={() => setSelectionMode(false)}
              className={`flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all ${
                !selectionMode
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Click pixels individually and pan/zoom the map"
            >
              <span className="flex items-center justify-center gap-1 md:gap-2">
                <span className="text-sm md:text-lg">👆</span>
                <span className="hidden sm:inline">Single Pixel + Pan</span>
                <span className="sm:hidden">Single</span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectionMode(true)}
              className={`flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all ${
                selectionMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-200 text-blue-900 hover:bg-blue-300'
              }`}
              title="Drag to select multiple pixels for batch update"
            >
              <span className="flex items-center justify-center gap-1 md:gap-2">
                <span className="text-sm md:text-lg">⬚</span>
                <span className="hidden sm:inline">Multi-Select Mode</span>
                <span className="sm:hidden">Multi</span>
              </span>
            </button>
          </div>
          
          {selectionMode && (
            <div className="mt-1 md:mt-2 text-[9px] md:text-xs text-center text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 p-1 md:p-2 rounded">
              Drag on map to select area
            </div>
          )}
        </div>
        
        <StatusPanel
          className=""
          selectedPixel={selectedPixel}
        />
        
        <UpdatePixelPanel
          className=""
          selectedPixels={selectedPixels}
          onClose={handleClearSelection}
        />
        
        <ChatDisplay className="flex-1 min-h-[100px] overflow-y-auto" />
        <ChatInput className="" />
      </div>
    </div>
  );
}
