'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useWriteContract, useSwitchChain, usePublicClient, useChainId } from 'wagmi';
import { PIXEL_MAP_CONTRACT_CONFIG } from '@/config/contractConfig';
import { arbitrumNova } from 'wagmi/chains';

interface UpdatePixelPanelProps {
  className?: string;
  selectedPixels: { x: number; y: number }[];
  onClose?: () => void;
}

interface PixelUpdate {
  x: number;
  y: number;
  image: string;
  status: 'pending' | 'signing' | 'confirming' | 'success' | 'failed';
  txHash?: string;
  error?: string;
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
  const [pixelUpdates, setPixelUpdates] = useState<PixelUpdate[]>([]);
  const [currentPixelIndex, setCurrentPixelIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Wagmi hooks for contract interaction
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const currentChainId = useChainId();

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

  // Helper to split image into individual pixel tiles
  const splitImageIntoTiles = (): PixelUpdate[] => {
    if (!canvasRef.current) return [];
    
    const canvas = canvasRef.current;
    const pixelSize = 10;
    
    return selectedPixels.map(pixel => {
      const localX = pixel.x - areaDimensions.minX;
      const localY = pixel.y - areaDimensions.minY;
      
      // Extract this pixel's portion from the canvas
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = pixelSize;
      tileCanvas.height = pixelSize;
      const tileCtx = tileCanvas.getContext('2d');
      
      if (tileCtx) {
        tileCtx.drawImage(
          canvas,
          localX * pixelSize, localY * pixelSize, pixelSize, pixelSize,
          0, 0, pixelSize, pixelSize
        );
      }
      
      return {
        x: pixel.x,
        y: pixel.y,
        image: tileCanvas.toDataURL('image/png'),
        status: 'pending' as const,
      };
    });
  };

  // Process a single pixel update transaction
  const processPixelUpdate = async (pixelUpdate: PixelUpdate, index: number, total: number): Promise<boolean> => {
    try {
      setTxStatus(`Pixel ${index + 1}/${total}: Waiting for signature (${pixelUpdate.x}, ${pixelUpdate.y})...`);
      
      // Update pixel status to signing
      setPixelUpdates(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'signing' as const } : p
      ));

      // Send the transaction
      const hash = await writeContractAsync({
        address: PIXEL_MAP_CONTRACT_CONFIG.address as `0x${string}`,
        abi: PIXEL_MAP_CONTRACT_CONFIG.abi,
        functionName: 'update',
        args: [BigInt(pixelUpdate.x), BigInt(pixelUpdate.y), pixelUpdate.image],
        chainId: arbitrumNova.id,
      });

      console.log(`Pixel (${pixelUpdate.x}, ${pixelUpdate.y}) tx submitted: ${hash}`);
      
      // Update status to confirming
      setPixelUpdates(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'confirming' as const, txHash: hash } : p
      ));
      setTxStatus(`Pixel ${index + 1}/${total}: Confirming transaction...`);

      // Wait for confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Update status to success
      setPixelUpdates(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'success' as const } : p
      ));
      
      return true;
    } catch (error) {
      console.error(`Error updating pixel (${pixelUpdate.x}, ${pixelUpdate.y}):`, error);
      
      // Update status to failed
      setPixelUpdates(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'failed' as const, error: error instanceof Error ? error.message : 'Unknown error' } : p
      ));
      
      return false;
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !isConnected || !address || !canvasRef.current) {
      alert('Please connect wallet and select an image');
      return;
    }

    // Check if on correct chain and wait for switch to complete
    if (currentChainId !== arbitrumNova.id) {
      setTxStatus('Switching to Arbitrum Nova...');
      try {
        await switchChainAsync({ chainId: arbitrumNova.id });
        // Wait a bit for the wallet to fully update
        await new Promise(resolve => setTimeout(resolve, 500));
        // Verify the chain actually switched
        if (chain?.id !== arbitrumNova.id) {
          setTxStatus('Please confirm the network switch in your wallet, then try again');
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to switch chain:', err);
        setTxStatus('Please switch to Arbitrum Nova network in your wallet');
        setUploading(false);
        return;
      }
    }

    setUploading(true);
    setTxStatus('Preparing images...');
    setCurrentPixelIndex(0);

    try {
      // Split image into individual tiles
      const tiles = splitImageIntoTiles();
      setPixelUpdates(tiles);
      
      console.log(`Processing ${tiles.length} pixel updates...`);
      
      let successCount = 0;
      let failCount = 0;

      // Process each pixel sequentially
      for (let i = 0; i < tiles.length; i++) {
        setCurrentPixelIndex(i);
        const success = await processPixelUpdate(tiles[i], i, tiles.length);
        
        if (success) {
          successCount++;
        } else {
          failCount++;
          // Ask user if they want to continue after a failure
          if (i < tiles.length - 1) {
            const continueUpdate = window.confirm(
              `Pixel (${tiles[i].x}, ${tiles[i].y}) failed. Continue with remaining ${tiles.length - i - 1} pixels?`
            );
            if (!continueUpdate) break;
          }
        }
      }

      // Final status - let user know map will refresh shortly
      if (failCount === 0) {
        setTxStatus(`✅ All ${successCount} pixels updated! Map will refresh in ~12s...`);
      } else {
        setTxStatus(`⚠️ ${successCount} succeeded, ${failCount} failed. Map refreshing in ~12s...`);
      }

      // Trigger map refresh (PixelMapViewer will wait for backend to process)
      window.dispatchEvent(new CustomEvent('pixelsUpdated'));

      // Clear form after longer delay to match the map refresh timing
      setTimeout(() => {
        if (failCount === 0) {
          setImageFile(null);
          setImagePreview(null);
          setPixelUpdates([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (onClose) onClose();
        }
        setTxStatus('');
        setUploading(false);
      }, 13000); // Wait slightly longer than map refresh delay

    } catch (error) {
      console.error('Error in batch upload:', error);
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
            txStatus.includes('Error') || txStatus.includes('failed')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : txStatus.includes('✅') || txStatus.includes('success')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          }`}>
            {uploading && <span className="inline-block animate-spin mr-1">⏳</span>}
            {txStatus}
          </div>
        )}

        {/* Multi-pixel Progress */}
        {pixelUpdates.length > 1 && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-[10px]">
            <div className="font-semibold mb-1">Transaction Progress:</div>
            <div className="grid grid-cols-6 gap-1">
              {pixelUpdates.map((p) => (
                <div 
                  key={`${p.x}-${p.y}`}
                  className={`p-1 rounded text-center ${
                    p.status === 'success' ? 'bg-green-200 text-green-800' :
                    p.status === 'failed' ? 'bg-red-200 text-red-800' :
                    p.status === 'confirming' ? 'bg-yellow-200 text-yellow-800 animate-pulse' :
                    p.status === 'signing' ? 'bg-blue-200 text-blue-800 animate-pulse' :
                    'bg-gray-200 text-gray-600'
                  }`}
                  title={`(${p.x}, ${p.y}): ${p.status}`}
                >
                  {p.status === 'success' ? '✓' : 
                   p.status === 'failed' ? '✗' : 
                   p.status === 'signing' ? '🔑' :
                   p.status === 'confirming' ? '⏳' : 
                   '○'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="text-[10px] text-gray-600 dark:text-gray-400">
          {isSinglePixel 
            ? 'This will update the pixel on the blockchain. You will need to sign a transaction.'
            : `⚠️ ${selectedPixels.length} pixels = ${selectedPixels.length} transactions. You'll sign each one individually.`
          }
        </div>
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex gap-2 flex-shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-2 px-3 rounded text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!imageFile || uploading || !isConnected}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-xs font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {uploading 
            ? `Updating ${currentPixelIndex + 1}/${selectedPixels.length}...` 
            : isSinglePixel 
              ? 'Update on Blockchain' 
              : `Update ${selectedPixels.length} Pixels`
          }
        </button>
      </div>
    </div>
  );
}
