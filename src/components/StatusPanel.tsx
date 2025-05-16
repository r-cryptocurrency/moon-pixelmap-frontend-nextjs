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
    <div className={`${className} flex flex-col gap-4`}>
      {/* Wallet connection status */}
      <div className="bg-black/20 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Wallet Status</h3>
        {isWalletConnected ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <div className="mt-1 text-sm text-white/70 truncate font-mono">
              {walletAddress}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Not connected</span>
            </div>
            <button 
              onClick={onConnectWallet} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
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