import PixelInfoCard from './PixelInfoCard';

interface StatusPanelProps {
  className?: string;
  selectedPixel?: { x: number, y: number };
  isWalletConnected?: boolean;
  walletAddress?: string;
  onConnectWallet?: () => void;
}

export default function StatusPanel({ 
  className = '', 
  selectedPixel, 
  isWalletConnected = false,
  walletAddress = '',
  onConnectWallet
}: StatusPanelProps) {
  return (
    <div className={`${className} flex flex-col gap-6`}>
      {/* Wallet connection status */}
      <div className="panel p-0 h-full">
        <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Wallet Status</h3>
        <div className="p-3">
          {isWalletConnected ? (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-800 text-xs">Connected</span>
              </div>
              <div className="mt-1 text-xs text-gray-600 truncate font-mono">
                {walletAddress}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span className="text-gray-800 text-xs">Not connected</span>
              </div>
              <button 
                onClick={onConnectWallet} 
                className="hover-enhanced bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-1 px-3 rounded-md text-xs shadow-lg"
              >
                Connect Wallet
              </button>
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