'use client';

import PixelInfoCard from './PixelInfoCard';
import { useWallet } from '@/context/WalletContext';
import { useUserPixels } from '@/hooks/useUserPixels';

interface StatusPanelProps {
  className?: string;
  selectedPixel?: { x: number, y: number };
}

export default function StatusPanel({ 
  className = '', 
  selectedPixel
}: StatusPanelProps) {
  // Use our wallet context instead of props
  const { isConnected, displayAddress, connect, disconnect } = useWallet();
  // Get user's pixel data
  const { loading: loadingPixels, ownedPixelsCount, error: pixelsError } = useUserPixels();
  return (
    <div className={`${className} flex flex-col gap-6`}>
      {/* Wallet connection status */}
      <div className="panel p-0 h-full">
        <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Wallet Status</h3>
        <div className="p-3">
          {isConnected ? (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-800 text-xs">Connected</span>
              </div>
              <div className="mt-1 text-xs text-gray-600 truncate font-mono">
                {displayAddress}
              </div>
              
              {/* Display owned pixels info */}
              <div className="mt-2 bg-blue-50 p-2 rounded-md text-xs">
                {loadingPixels ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-500"></div>
                    <span className="text-blue-500">Loading your pixel data...</span>
                  </div>
                ) : pixelsError ? (
                  <div className="text-red-500">Error loading your pixel data</div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Your pixels:</span>
                    <span className="font-bold text-blue-700">{ownedPixelsCount !== null ? ownedPixelsCount : '-'}</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={disconnect} 
                className="mt-2 hover-enhanced bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-1 px-3 rounded-md text-xs shadow-lg"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span className="text-gray-800 text-xs">Not connected</span>
              </div>
              <button 
                onClick={connect} 
                className="hover-enhanced bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-1 px-3 rounded-md text-xs shadow-lg"
              >
                Connect Wallet
              </button>
              
              {/* Optional: Show network-specific message */}
              <p className="mt-2 text-xs text-gray-500">
                Connect to Ethereum to view and manage your pixels
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected pixel information */}
      <PixelInfoCard 
        x={selectedPixel?.x} 
        y={selectedPixel?.y} 
      />
    </div>
  );
}