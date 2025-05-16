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
      <div className="panel p-4 h-full">
        <h3 className="text-lg font-bold mb-2">Wallet Status</h3>
        {isWalletConnected ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-800">Connected</span>
            </div>
            <div className="mt-1 text-sm text-gray-600 truncate font-mono">
              {walletAddress}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-800">Not connected</span>
            </div>
            <button 
              onClick={onConnectWallet} 
              className="hover-enhanced bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-1.5 px-4 rounded-md text-sm shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Selected pixel information */}
      <PixelInfoCard 
        x={selectedPixel?.x} 
        y={selectedPixel?.y} 
      />
    </div>
  );
}