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
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md h-full">
        <h3 className="text-lg font-bold mb-2 text-white">Wallet Status</h3>
        {isWalletConnected ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white">Connected</span>
            </div>
            <div className="mt-1 text-sm text-gray-300 truncate font-mono">
              {walletAddress}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white">Not connected</span>
            </div>
            <button 
              onClick={onConnectWallet} 
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-1.5 px-4 rounded-md text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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