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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 md:p-4 h-[calc(100vh-8rem)] mx-auto w-full max-w-[1800px]">
      {/* Main pixel map - full width on mobile, 2/3 on desktop */}
      <PixelMapArea 
        className="md:col-span-2 h-[40vh] md:h-full overflow-hidden" 
        onPixelSelect={handlePixelSelect}
        onAreaSelect={handleAreaSelect}
        selectionMode={selectionMode}
      />
      
      {/* Side panel - stacks below on mobile */}
      <div className="md:col-span-1 h-auto md:h-full flex flex-col gap-1 overflow-y-auto">
        {/* Map Control Panel */}
        <div className="panel p-2 lg:p-3">
          <h3 className="text-[10px] lg:text-xs font-bold mb-1 lg:mb-2 text-gray-700 dark:text-gray-300">MAP CONTROLS</h3>
          <div className="flex flex-row lg:flex-col gap-1 lg:gap-2">
            <button
              onClick={() => setSelectionMode(false)}
              className={`flex-1 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold text-[10px] lg:text-sm transition-all ${
                !selectionMode
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Click pixels individually and pan/zoom the map"
            >
              <span className="flex items-center justify-center gap-1 lg:gap-2">
                <span className="text-sm lg:text-lg">👆</span>
                <span className="hidden sm:inline">Single Pixel + Pan</span>
                <span className="sm:hidden">Single</span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectionMode(true)}
              className={`flex-1 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold text-[10px] lg:text-sm transition-all ${
                selectionMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-200 text-blue-900 hover:bg-blue-300'
              }`}
              title="Drag to select multiple pixels for batch update"
            >
              <span className="flex items-center justify-center gap-1 lg:gap-2">
                <span className="text-sm lg:text-lg">⬚</span>
                <span className="hidden sm:inline">Multi-Select Mode</span>
                <span className="sm:hidden">Multi</span>
              </span>
            </button>
          </div>
          
          {selectionMode && (
            <div className="mt-1 lg:mt-2 text-[9px] lg:text-xs text-center text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 p-1 lg:p-2 rounded">
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
