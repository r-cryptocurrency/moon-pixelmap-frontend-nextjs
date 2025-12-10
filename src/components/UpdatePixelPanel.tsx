'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { PIXEL_MAP_CONTRACT_CONFIG } from '@/config/contractConfig';
import { arbitrumNova } from 'wagmi/chains';

interface UpdatePixelPanelProps {
  className?: string;
  selectedPixels: { x: number; y: number }[];
  onClose?: () => void;
}

export default function UpdatePixelPanel({ 
  className = '', 
  selectedPixels,
  onClose 
}: UpdatePixelPanelProps) {
  const { address, isConnected, chain } = useAccount();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Wagmi hooks for contract interaction
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Image validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  // Calculate area dimensions
  const areaDimensions = selectedPixels.length > 0 ? {
    minX: Math.min(...selectedPixels.map(p => p.x)),
    maxX: Math.max(...selectedPixels.map(p => p.x)),
    minY: Math.min(...selectedPixels.map(p => p.y)),
    maxY: Math.max(...selectedPixels.map(p => p.y)),
    width: Math.max(...selectedPixels.map(p => p.x)) - Math.min(...selectedPixels.map(p => p.x)) + 1,
    height: Math.max(...selectedPixels.map(p => p.y)) - Math.min(...selectedPixels.map(p => p.y)) + 1,
  } : { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 1, height: 1 };

  const isSinglePixel = selectedPixels.length === 1;
  const canvasWidth = areaDimensions.width * 10;
  const canvasHeight = areaDimensions.height * 10;

  // TODO: Re-enable when batch blockchain updates are implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateMultiPixelOwnership = async (): Promise<boolean> => {
    if (!address) {
      alert('Please connect your wallet');
      return false;
    }
    
    try {
      // Fetch all pixels from the blockchain
      const response = await fetch('/api/pixels');
      
      if (!response.ok) {
        console.error('Failed to fetch pixels:', response.statusText);
        alert('Failed to verify pixel ownership. Please try again.');
        return false;
      }
      
      const allPixels = await response.json();
      
      // Create a map of owned pixels for this address
      const ownedPixelsSet = new Set(
        allPixels
          .filter((p: { current_owner?: string; x: number; y: number }) => 
            p.current_owner?.toLowerCase() === address.toLowerCase()
          )
          .map((p: { x: number; y: number }) => `${p.x},${p.y}`)
      );
      
      // Check if user owns all selected pixels
      const unownedPixels = selectedPixels.filter(
        pixel => !ownedPixelsSet.has(`${pixel.x},${pixel.y}`)
      );
      
      if (unownedPixels.length > 0) {
        alert(`You do not own ${unownedPixels.length} of the ${selectedPixels.length} selected pixels!`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating ownership:', error);
      alert('Error verifying pixel ownership. Please try again.');
      return false;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please use PNG, JPEG, GIF, or WebP.');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
      setImageFile(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess && txHash) {
      setTxStatus('Transaction confirmed!');
      setUploading(false);
      
      // Clear the form
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the map
      window.dispatchEvent(new CustomEvent('pixelsUpdated'));
      
      // Clear selection after delay
      setTimeout(() => {
        setTxStatus('');
        if (onClose) onClose();
      }, 2000);
    }
  }, [isTxSuccess, txHash, onClose]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('Contract write error:', writeError);
      setTxStatus(`Error: ${writeError.message.substring(0, 100)}`);
      setUploading(false);
    }
  }, [writeError]);

  const handleUpload = async () => {
    if (!imageFile || !isConnected || !address || !canvasRef.current) {
      alert('Please connect wallet and select an image');
      return;
    }

    // Check if on correct chain
    if (chain?.id !== arbitrumNova.id) {
      setTxStatus('Switching to Arbitrum Nova...');
      try {
        switchChain({ chainId: arbitrumNova.id });
        // Wait a bit for chain switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error('Failed to switch chain:', err);
        setTxStatus('Please switch to Arbitrum Nova network');
        return;
      }
    }

    // For now, only support single pixel updates via blockchain
    // Multi-pixel batch updates would need a different contract function or multiple transactions
    if (!isSinglePixel) {
      alert('Blockchain updates currently only support single pixel updates. Please select one pixel at a time.');
      return;
    }

    setUploading(true);
    setTxStatus('Preparing image...');

    try {
      const canvas = canvasRef.current;
      // Get the image as a base64 data URI - this IS the tokenURI stored on-chain
      const tokenURI = canvas.toDataURL('image/png');
      
      const pixel = selectedPixels[0];
      
      console.log(`Updating pixel (${pixel.x}, ${pixel.y}) with ${tokenURI.length} byte image`);
      setTxStatus('Waiting for wallet signature...');

      // Call the smart contract's update function directly with the base64 data URI
      writeContract({
        address: PIXEL_MAP_CONTRACT_CONFIG.address as `0x${string}`,
        abi: PIXEL_MAP_CONTRACT_CONFIG.abi,
        functionName: 'update',
        args: [BigInt(pixel.x), BigInt(pixel.y), tokenURI],
        chainId: arbitrumNova.id,
      });

      setTxStatus('Transaction submitted, waiting for confirmation...');
      
    } catch (error) {
      console.error('Error uploading:', error);
      setTxStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  // Draw preview on canvas
  useEffect(() => {
    if (imagePreview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        };
        img.src = imagePreview;
      }
    }
  }, [imagePreview, canvasWidth, canvasHeight]);

  if (selectedPixels.length === 0) {
    return (
      <div className={`${className} panel p-3`}>
        <h3 className="text-xs font-bold mb-2 text-gray-700 dark:text-gray-300">Update Pixel</h3>
        <div className="text-xs text-gray-500 text-center py-4">
          {isSinglePixel ? 'Click a pixel on the map' : 'Select pixels on the map'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} panel p-3 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {isSinglePixel 
            ? `Update Pixel (${selectedPixels[0].x}, ${selectedPixels[0].y})`
            : `Update ${selectedPixels.length} Pixels`
          }
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mb-3">
        {/* Area Info for Multi-Select */}
        {!isSinglePixel && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Selected Area: {areaDimensions.width}×{areaDimensions.height} pixels
            </div>
            <div className="text-blue-700 dark:text-blue-300 text-[10px]">
              Position: ({areaDimensions.minX}, {areaDimensions.minY}) to ({areaDimensions.maxX}, {areaDimensions.maxY})
            </div>
          </div>
        )}

        {/* File Input */}
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Upload Image (for {canvasWidth}×{canvasHeight}px)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-[10px] w-full"
          />
          <div className="text-[9px] text-gray-500 mt-1">
            Max 5MB. Supports PNG, JPEG, GIF, WebP
          </div>
          {imageError && (
            <div className="mt-1 text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
              ⚠️ {imageError}
            </div>
          )}
        </div>

        {/* Preview Canvas */}
        {imagePreview && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Preview ({canvasWidth}×{canvasHeight}px):
            </div>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {txStatus && (
          <div className={`mb-3 p-2 rounded text-xs ${
            txStatus.includes('Error') 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : txStatus.includes('confirmed')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          }`}>
            {isTxLoading && <span className="inline-block animate-spin mr-1">⏳</span>}
            {txStatus}
            {txHash && (
              <div className="mt-1 text-[9px] font-mono break-all">
                <a 
                  href={`https://nova.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info Text */}
        <div className="text-[10px] text-gray-600 dark:text-gray-400">
          {isSinglePixel 
            ? 'This will upload to IPFS and update on the blockchain. You will need to sign a transaction.'
            : '⚠️ Multi-pixel blockchain updates coming soon. Currently only single pixel updates are supported.'
          }
        </div>
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex gap-2 flex-shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            disabled={uploading || isWritePending || isTxLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-2 px-3 rounded text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!imageFile || uploading || !isConnected || isWritePending || isTxLoading || !isSinglePixel}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-xs font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {isWritePending ? 'Check Wallet...' : isTxLoading ? 'Confirming...' : uploading ? 'Preparing...' : 'Update on Blockchain'}
        </button>
      </div>
    </div>
  );
}
