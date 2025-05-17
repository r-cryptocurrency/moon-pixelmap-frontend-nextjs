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
    <div className={`${className} flex flex-col gap-6`}>
      {/* Wallet connection status */}
      <div className="panel p-0 h-full">
        <h3 className="text-[11px] font-bold px-3 py-1 border-b border-gray-300">Wallet Status</h3>
        <div className="p-2.5">
          {isConnected ? (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-800 text-[10px]">Connected</span>
              </div>
              <div className="mt-1 text-[10px] text-gray-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {displayAddress}
              </div>
              
              <div className="mt-2 bg-blue-50 p-2 rounded-md text-[10px]">
                {loadingPixels ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="animate-spin rounded-full h-2 w-2 border-t-2 border-blue-500"></div>
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
                onClick={() => disconnect()}
                className="mt-2 hover-enhanced bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-0.5 px-2 rounded-md text-[10px] shadow-lg w-full"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-800 text-[10px]">Not connected</span>
              </div>
              <button 
                onClick={() => appKit?.open()}
                disabled={isLoadingConnection || !appKit}
                className={`hover-enhanced bg-gradient-to-r ${isLoadingConnection || !appKit ? 'from-gray-400 to-gray-500' : 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'} text-white py-0.5 px-2 rounded-md text-[10px] shadow-lg flex items-center justify-center w-full`}
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
              
              <p className="mt-2 text-[10px] text-gray-500">
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