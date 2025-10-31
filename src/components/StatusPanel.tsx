'use client';

import PixelInfoCard from './PixelInfoCard';
import { useUserPixels } from '@/hooks/useUserPixels';
import { useAppKitContext } from '@/app/providers';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

interface StatusPanelProps {
  className?: string;
  selectedPixel?: { x: number, y: number };
}

export default function StatusPanel({ 
  className = '', 
  selectedPixel
}: StatusPanelProps) {
  const appKit = useAppKitContext();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { loading: loadingPixels, ownedPixelsCount, error: pixelsError } = useUserPixels();

  const [displayAddress, setDisplayAddress] = useState('');

  useEffect(() => {
    if (address) {
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
    } else {
      setDisplayAddress('');
    }
  }, [address]);

  const isLoadingConnection = isConnecting || isReconnecting;

  return (
    <div className={`${className} flex flex-col gap-2`}>
      {/* Wallet connection status */}
      <div className="panel p-0 flex-shrink-0">
        <h3 className="text-[11px] font-bold px-3 py-1 border-b border-gray-300">Wallet Status</h3>
        <div className="p-2">
          {isConnected ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-800 text-[10px]">Connected</span>
              </div>
              <div className="text-[10px] text-gray-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {displayAddress}
              </div>
              
              <div className="bg-blue-50 p-1.5 rounded text-[10px]">
                {loadingPixels ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="animate-spin rounded-full h-2 w-2 border-t-2 border-blue-500"></div>
                    <span className="text-blue-500">Loading...</span>
                  </div>
                ) : pixelsError ? (
                  <div className="text-red-500">Error loading pixels</div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Your pixels:</span>
                    <span className="font-bold text-blue-700">{ownedPixelsCount !== null ? ownedPixelsCount : '-'}</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => disconnect()}
                className="hover-enhanced bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-1 px-2 rounded text-[10px] shadow w-full"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-800 text-[10px]">Not connected</span>
              </div>
              <button 
                onClick={() => appKit?.open()}
                disabled={isLoadingConnection || !appKit}
                className={`hover-enhanced bg-gradient-to-r ${
                  isLoadingConnection || !appKit 
                    ? 'from-gray-400 to-gray-500' 
                    : 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                } text-white py-1 px-2 rounded text-[10px] shadow flex items-center justify-center w-full`}
              >
                {isLoadingConnection ? (
                  <>
                    <div className="animate-spin mr-1 h-2 w-2 border border-t-2 border-white rounded-full"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
              
              <p className="text-[10px] text-gray-500">
                Connect to view your pixels
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