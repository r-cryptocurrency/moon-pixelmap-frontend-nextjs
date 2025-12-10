'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';

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
  const { address, isConnected } = useAccount();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Validate ownership
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

  const handleUpload = async () => {
    if (!imageFile || !isConnected || !address || !canvasRef.current) {
      alert('Please connect wallet and select an image');
      return;
    }

    // Validate ownership for multi-pixel
    if (!isSinglePixel) {
      const isOwner = await validateMultiPixelOwnership();
      if (!isOwner) return;
    }

    setUploading(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Split the image into individual pixel tiles
      const pixelSize = 10; // Each pixel is rendered as 10x10 on canvas
      const pixelsWithImages = selectedPixels.map(pixel => {
        // Calculate the position of this pixel within the selected area
        const localX = pixel.x - areaDimensions.minX;
        const localY = pixel.y - areaDimensions.minY;
        
        // Extract this pixel's portion from the canvas
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = pixelSize;
        tileCanvas.height = pixelSize;
        const tileCtx = tileCanvas.getContext('2d');
        
        if (tileCtx) {
          // Copy the pixel's portion from main canvas
          tileCtx.drawImage(
            canvas,
            localX * pixelSize, localY * pixelSize, pixelSize, pixelSize, // source
            0, 0, pixelSize, pixelSize // destination
          );
        }
        
        return {
          x: pixel.x,
          y: pixel.y,
          image: tileCanvas.toDataURL('image/png')
        };
      });

      console.log(`Uploading ${pixelsWithImages.length} pixels with individual 10x10px images`);

      // Send as JSON with individual images per pixel
      const response = await fetch('/api/pixels-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          pixels: pixelsWithImages,
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        alert(`Image uploaded successfully! Updated ${selectedPixels.length} pixel(s)`);
        
        // Clear the uploaded image and reset preview
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Refresh the map by triggering a re-render
        window.dispatchEvent(new CustomEvent('pixelsUpdated'));
        
        // Clear selection after a brief delay to let user see the result
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      } else {
        alert(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading image');
    } finally {
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

        {/* Info Text */}
        <div className="text-[10px] text-gray-600 dark:text-gray-400">
          This image will be saved to the blockchain.
        </div>
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex gap-2 flex-shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-3 rounded text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!imageFile || uploading || !isConnected}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-xs font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : (isSinglePixel ? 'Update Pixel' : 'Update Pixels')}
        </button>
      </div>
    </div>
  );
}
