'use client';

import { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { fetchPixelsData, updatePixel, PixelData } from '@/services/api';
import { PIXEL_MAP_CONTRACT_CONFIG } from '@/config/contractConfig';

interface UpdatePixelModalProps {
  x?: number;
  y?: number;
  pixels?: { x: number; y: number }[];  // Support multi-pixel selection
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIXEL_BLOCK_DIMENSION = 10; // Each pixel block is 10x10 actual pixels

interface OwnedPixel {
  x: number;
  y: number;
}

export default function UpdatePixelModal({ 
  x, 
  y, 
  pixels,
  isOpen, 
  onClose,
  onSuccess
}: UpdatePixelModalProps) {
  const { address, isConnected } = useAccount();
  const [processedImageData, setProcessedImageData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isOwnerOfSelectedPixel, setIsOwnerOfSelectedPixel] = useState(false);
  const [contiguousOwnedArea, setContiguousOwnedArea] = useState<OwnedPixel[]>([]);
  const [showAreaUpdatePrompt, setShowAreaUpdatePrompt] = useState(false);
  const [updateScope, setUpdateScope] = useState<'single' | 'area'>('single'); // 'single' or 'area'

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if we're in multi-select mode
  const isMultiSelectMode = pixels && pixels.length > 0;
  const targetPixels = isMultiSelectMode ? pixels : (x !== undefined && y !== undefined ? [{ x, y }] : []);
  const primaryPixel = targetPixels[0];

  // Check if the contract address is available before attempting to use it.
  const isContractAddressAvailable = !!PIXEL_MAP_CONTRACT_CONFIG.address;

  const { data: blockOwner, error: ownerError, isLoading: isLoadingOwner, refetch: refetchOwner } = useReadContract({
    ...PIXEL_MAP_CONTRACT_CONFIG,
    functionName: 'ownerOfBlock',
    args: primaryPixel ? [BigInt(primaryPixel.x), BigInt(primaryPixel.y)] : undefined,
    query: {
        // Only enable the query if the modal is open, user is connected, and contract address is available.
        enabled: isOpen && isConnected && !!address && isContractAddressAvailable && !!primaryPixel,
    }
  });

  useEffect(() => {
    // If the contract address is not available, set an error message and disable ownership-dependent features.
    if (!isContractAddressAvailable) {
      setError("Contract address is not configured. Pixel operations are disabled.");
      setIsOwnerOfSelectedPixel(false);
      setContiguousOwnedArea([]);
      setShowAreaUpdatePrompt(false);
      return; // Stop further execution in this effect if address is missing
    }

    if (isOpen && isConnected && address) {
        refetchOwner(); 
    } else {
        setIsOwnerOfSelectedPixel(false);
        setContiguousOwnedArea([]);
        setShowAreaUpdatePrompt(false);
    }
  }, [isOpen, isConnected, address, refetchOwner, isContractAddressAvailable]);

  useEffect(() => {
    if (!isContractAddressAvailable) return; // Guard against missing contract address

    if (isOpen && isConnected && address && !isLoadingOwner && primaryPixel) {
      if (blockOwner === address) {
        setIsOwnerOfSelectedPixel(true);
        if (isMultiSelectMode) {
          // In multi-select mode, validate ownership of all pixels
          validateMultiPixelOwnership(targetPixels, address);
        } else {
          // In single pixel mode, find contiguous area
          findContiguousArea(primaryPixel.x, primaryPixel.y, address);
        }
      } else {
        setIsOwnerOfSelectedPixel(false);
        setContiguousOwnedArea([]);
        setShowAreaUpdatePrompt(false);
      }
    }
  }, [isOpen, isConnected, address, blockOwner, primaryPixel?.x, primaryPixel?.y, isLoadingOwner, isMultiSelectMode]); // Added isLoadingOwner

  const validateMultiPixelOwnership = async (pixels: OwnedPixel[], ownerAddress: string) => {
    try {
      const allPixels = await fetchPixelsData();
      const pixelOwnerMap = new Map<string, string>();
      allPixels.forEach(p => {
        pixelOwnerMap.set(`${p.x},${p.y}`, p.owner.toLowerCase());
      });
      
      // Check if user owns all selected pixels
      const unownedPixels: OwnedPixel[] = [];
      const ownedPixels: OwnedPixel[] = [];
      
      pixels.forEach(pixel => {
        const key = `${pixel.x},${pixel.y}`;
        const owner = pixelOwnerMap.get(key);
        if (owner === ownerAddress.toLowerCase()) {
          ownedPixels.push(pixel);
        } else {
          unownedPixels.push(pixel);
        }
      });
      
      if (unownedPixels.length > 0) {
        setError(`You don't own ${unownedPixels.length} of the ${pixels.length} selected pixels. Only owned pixels will be updated.`);
        setContiguousOwnedArea(ownedPixels);
      } else {
        setContiguousOwnedArea(ownedPixels);
      }
      
      setShowAreaUpdatePrompt(ownedPixels.length > 1);
      setUpdateScope(ownedPixels.length > 1 ? 'area' : 'single');
    } catch (err) {
      console.error("Error validating multi-pixel ownership:", err);
      setError("Could not validate ownership of all selected pixels.");
      setContiguousOwnedArea(pixels); // Fallback to attempting all
    }
  };

  const findContiguousArea = async (startX: number, startY: number, ownerAddress: string) => {
    try {
      // To prevent multiple loading states, use a specific loader for this phase if needed
      // setIsLoading(true); 
      const allPixels = await fetchPixelsData();
      const ownedPixelsMap = new Map<string, OwnedPixel>();
      allPixels.forEach(p => {
        if (p.owner.toLowerCase() === ownerAddress.toLowerCase()) {
          ownedPixelsMap.set(`${p.x},${p.y}`, { x: p.x, y: p.y });
        }
      });
      
      if (!ownedPixelsMap.has(`${startX},${startY}`)) {
        setContiguousOwnedArea([{ x: startX, y: startY }]);
        setShowAreaUpdatePrompt(false);
        // setIsLoading(false);
        return;
      }

      const queue: OwnedPixel[] = [{ x: startX, y: startY }];
      const visited = new Set<string>();
      const area: OwnedPixel[] = [];
      visited.add(`${startX},${startY}`);

      while (queue.length > 0) {
        const current = queue.shift()!;
        area.push(current);

        const neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
        ];

        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`;
          if (!visited.has(key) && ownedPixelsMap.has(key)) {
            visited.add(key);
            queue.push(neighbor);
          }
        }
      }
      
      setContiguousOwnedArea(area);
      if (area.length > 1) {
        setShowAreaUpdatePrompt(true);
        setUpdateScope('area'); 
      } else {
        setShowAreaUpdatePrompt(false);
        setUpdateScope('single');
      }
    } catch (err) {
      console.error("Error finding contiguous area:", err);
      setError("Could not determine full owned area. Updates will apply to the selected pixel only.");
      setContiguousOwnedArea([{ x: startX, y: startY }]); // Fallback to single pixel
      setShowAreaUpdatePrompt(false);
    } finally {
      // setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setProcessedImageData('');
      setOriginalImageSrc(null);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
      setShowAreaUpdatePrompt(false);
      setContiguousOwnedArea([]);
      setIsOwnerOfSelectedPixel(false);
      setUpdateScope('single');
      onClose();
    }
  };
  
  const drawPlaceholderOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0'; // Light gray placeholder
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#a0a0a0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = 'Preview';
        if (updateScope === 'area' && contiguousOwnedArea.length > 0) {
            const dims = getAreaDimensions();
            label = `${dims.width * PIXEL_BLOCK_DIMENSION}x${dims.height * PIXEL_BLOCK_DIMENSION}`;
        } else {
            label = `10x10`;
        }
        ctx.font = canvas.width > 50 ? '12px sans-serif' : '8px sans-serif';
        ctx.fillText(label, canvas.width / 2, canvas.height / 2);
      }
    }
  }, [contiguousOwnedArea, updateScope]); // Added dependencies

  useEffect(() => {
    if (isOpen) {
      // Initial placeholder draw when modal opens
      drawPlaceholderOnCanvas(); 
      setProcessedImageData(''); // Clear any previous image data
      setOriginalImageSrc(null);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Reset area specific states on open, will be re-evaluated by other useEffects
      setShowAreaUpdatePrompt(false);
      // setContiguousOwnedArea([]); // Keep this to avoid flicker if already calculated
      // setIsOwnerOfSelectedPixel(false); // Keep this to avoid flicker
      setUpdateScope('single');
    } else {
        // Clear processed image data when modal is fully closed
        setProcessedImageData('');
        setOriginalImageSrc(null);
        setFileName(null);
    }
  }, [isOpen, drawPlaceholderOnCanvas]);

  // Re-draw placeholder if scope changes and no image is yet loaded
  useEffect(() => {
    if (isOpen && !originalImageSrc) {
        drawPlaceholderOnCanvas();
    }
  }, [updateScope, isOpen, originalImageSrc, drawPlaceholderOnCanvas]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null); // Clear previous errors
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        setOriginalImageSrc(imgSrc); // Show original image preview

        const img = new Image();
        img.onload = () => {
          let targetWidth = PIXEL_BLOCK_DIMENSION;
          let targetHeight = PIXEL_BLOCK_DIMENSION;

          if (updateScope === 'area' && contiguousOwnedArea.length > 0) {
            const { width: areaWidthInBlocks, height: areaHeightInBlocks } = getAreaDimensions();
            targetWidth = areaWidthInBlocks * PIXEL_BLOCK_DIMENSION;
            targetHeight = areaHeightInBlocks * PIXEL_BLOCK_DIMENSION;
          }
          
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = targetWidth;
          offscreenCanvas.height = targetHeight;
          const ctx = offscreenCanvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = false; // Use nearest neighbor for pixel art scaling
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const scaledImageData = offscreenCanvas.toDataURL('image/png');
            setProcessedImageData(scaledImageData);

            const previewCanvas = canvasRef.current;
            if (previewCanvas) {
              const previewCtx = previewCanvas.getContext('2d');
              if (previewCtx) {
                previewCtx.clearRect(0,0, previewCanvas.width, previewCanvas.height);
                previewCtx.imageSmoothingEnabled = false; 
                previewCtx.drawImage(offscreenCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
              }
            }
          }
        };
        img.onerror = () => {
          setError('Failed to load image. Please try a different file.');
          setProcessedImageData('');
          setOriginalImageSrc(null);
          drawPlaceholderOnCanvas();
        };
        img.src = imgSrc;
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        setProcessedImageData('');
        setOriginalImageSrc(null);
        drawPlaceholderOnCanvas();
      };
      reader.readAsDataURL(file);
    } else {
      // If file input is cleared
      setProcessedImageData('');
      setOriginalImageSrc(null);
      setFileName(null);
      drawPlaceholderOnCanvas(); // Redraw placeholder
    }
  };
  
  const handleSubmit = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }
    if (!isOwnerOfSelectedPixel && updateScope === 'single') {
        setError('You do not own this pixel.');
        return;
    }
    if (updateScope === 'area' && (!isOwnerOfSelectedPixel || contiguousOwnedArea.length === 0)) {
        setError('Cannot update area. Ownership issue or no contiguous area found.');
        return;
    }
    
    if (!processedImageData) {
      setError('No image processed. Please upload an image.');
      return;
    }
    
    if (!primaryPixel) {
      setError('No pixel selected.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (updateScope === 'single') {
        // For single pixel, processedImageData is already 10x10
        await updatePixel(primaryPixel.x, primaryPixel.y, address as string, processedImageData);
      } else if (updateScope === 'area' && contiguousOwnedArea.length > 0) {
        // Load the processed image (which is scaled to the bounding box of the area)
        const sourceImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load processed image for area update.'));
          img.src = processedImageData; // This is the base64 of the image scaled to the bounding box
        });

        // Determine bounding box top-left for relative coordinate calculation
        const xs = contiguousOwnedArea.map(p => p.x);
        const ys = contiguousOwnedArea.map(p => p.y);
        const minXBlock = Math.min(...xs); // Top-left X in block coordinates
        const minYBlock = Math.min(...ys); // Top-left Y in block coordinates

        for (const pixel of contiguousOwnedArea) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = PIXEL_BLOCK_DIMENSION;
          cropCanvas.height = PIXEL_BLOCK_DIMENSION;
          const cropCtx = cropCanvas.getContext('2d');

          if (!cropCtx) {
            throw new Error('Failed to get 2D context for cropping canvas.');
          }
          cropCtx.imageSmoothingEnabled = false; // Keep pixel art sharp

          // Calculate source (sx, sy) from the full scaled image (sourceImg)
          // These are pixel coordinates on sourceImg
          const sx = (pixel.x - minXBlock) * PIXEL_BLOCK_DIMENSION;
          const sy = (pixel.y - minYBlock) * PIXEL_BLOCK_DIMENSION;

          // Draw the 10x10 portion for the current pixel onto the cropCanvas
          cropCtx.drawImage(
            sourceImg,             // The image scaled to the bounding box
            sx,                    // Source X on sourceImg (pixel coordinate)
            sy,                    // Source Y on sourceImg (pixel coordinate)
            PIXEL_BLOCK_DIMENSION, // Source width (10px block)
            PIXEL_BLOCK_DIMENSION, // Source height (10px block)
            0,                     // Destination X on cropCanvas (top-left)
            0,                     // Destination Y on cropCanvas (top-left)
            PIXEL_BLOCK_DIMENSION, // Destination width on cropCanvas
            PIXEL_BLOCK_DIMENSION  // Destination height on cropCanvas
          );

          const individualPixelImageData = cropCanvas.toDataURL('image/png');
          await updatePixel(pixel.x, pixel.y, address as string, individualPixelImageData);
        }
      }
      
      onSuccess(); // Call after successful single or all area updates
      handleClose(); // Close modal after success

    } catch (err) {
      console.error('Error updating pixel(s):', err);
      setError(err instanceof Error ? err.message : 'Failed to update pixel(s)');
      // onSuccess and handleClose are not called in case of error
    } finally {
      setIsLoading(false);
    }
  };
    
  if (!isOpen) return null;
  
  const getAreaDimensions = () => {
    if (contiguousOwnedArea.length === 0) return { width: 1, height: 1};
    const xs = contiguousOwnedArea.map(p => p.x);
    const ys = contiguousOwnedArea.map(p => p.y);
    return {
        width: Math.max(...xs) - Math.min(...xs) + 1,
        height: Math.max(...ys) - Math.min(...ys) + 1,
    };
  };

  const areaDimensions = getAreaDimensions();
  const previewCanvasLabel = updateScope === 'area' && contiguousOwnedArea.length > 0 
    ? `${areaDimensions.width * PIXEL_BLOCK_DIMENSION}x${areaDimensions.height * PIXEL_BLOCK_DIMENSION} Scaled Preview`
    : `10x10 Scaled Preview`;
  
  // Calculate canvas dimensions based on selection
  const canvasWidth = updateScope === 'area' && contiguousOwnedArea.length > 0
    ? areaDimensions.width * PIXEL_BLOCK_DIMENSION
    : PIXEL_BLOCK_DIMENSION;
  const canvasHeight = updateScope === 'area' && contiguousOwnedArea.length > 0
    ? areaDimensions.height * PIXEL_BLOCK_DIMENSION
    : PIXEL_BLOCK_DIMENSION;
  
  const buttonText = isLoading 
    ? 'Updating...' 
    : `Update ${updateScope === 'area' && contiguousOwnedArea.length > 1 ? `${contiguousOwnedArea.length} Pixels` : 'Pixel'}`;

  const isSubmitDisabled = isLoading || 
                         !processedImageData || 
                         (isLoadingOwner) || // Disable if still checking owner
                         (!isOwnerOfSelectedPixel && updateScope === 'single') || 
                         (updateScope === 'area' && (!isOwnerOfSelectedPixel || contiguousOwnedArea.length === 0));

  // Function to call when scope changes, to re-process image if one is selected
  const handleScopeChange = (newScope: 'single' | 'area') => {
    setUpdateScope(newScope);
    // If a file is already selected, trigger re-processing with the new scope
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        handleFileChange({ target: { files: fileInputRef.current.files } } as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="relative w-full max-w-lg my-8 rounded-lg shadow-2xl p-6"
        style={{ 
          backgroundColor: 'rgb(255, 255, 255)',
          border: '2px solid rgb(229, 231, 235)'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold" style={{ color: 'rgb(17, 24, 39)' }}>
            {isMultiSelectMode 
              ? `Update ${targetPixels.length} Pixel${targetPixels.length > 1 ? 's' : ''}` 
              : `Update Pixel (${primaryPixel?.x}, ${primaryPixel?.y})`}
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            style={{ lineHeight: '1' }}
          >
            &times;
          </button>
        </div>

        {(isLoadingOwner || (isOpen && !address)) && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Loading ownership details...</p>}
        {ownerError && <p className="text-red-500 mb-2">Error checking ownership: {ownerError.message}</p>}
        
        {isOpen && address && !isLoadingOwner && !isOwnerOfSelectedPixel && primaryPixel && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-700 dark:bg-opacity-30 text-yellow-700 dark:text-yellow-200 text-sm rounded">
                You do not own the selected pixel{isMultiSelectMode && targetPixels.length > 1 ? 's' : ''} ({primaryPixel.x}, {primaryPixel.y}).
            </div>
        )}

        {isOwnerOfSelectedPixel && (
          <>
            {showAreaUpdatePrompt && contiguousOwnedArea.length > 1 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">
                  You own a contiguous area of <strong>{contiguousOwnedArea.length} pixels</strong> (dimensions: {areaDimensions.width}x{areaDimensions.height} blocks). 
                  Update the single selected pixel ({x},{y}) or the entire area?
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleScopeChange('single')}
                    className={`px-3 py-1 text-sm rounded ${updateScope === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'}`}
                  >
                    Single ({x},{y})
                  </button>
                  <button 
                    onClick={() => handleScopeChange('area')}
                    className={`px-3 py-1 text-sm rounded ${updateScope === 'area' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'}`}
                  >
                    All {contiguousOwnedArea.length} Pixels ({areaDimensions.width}x{areaDimensions.height})
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="pixelImageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Image {updateScope === 'area' && contiguousOwnedArea.length > 0 ? `(for ${areaDimensions.width}x${areaDimensions.height} area)` : '(for 10x10 pixel)'}
              </label>
              <input 
                id="pixelImageUpload"
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/bmp, image/gif"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-700 file:text-blue-700 dark:file:text-blue-100 hover:file:bg-blue-100 dark:hover:file:bg-blue-600"
              />
              {fileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {fileName}</p>}
            </div>

            {originalImageSrc && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Preview:</p>
                <img src={originalImageSrc} alt="Original Uploaded Preview" className="max-w-full h-auto max-h-40 border border-gray-300 dark:border-gray-600 object-contain bg-white" />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{previewCanvasLabel}</label>
              <div className="border border-gray-300 dark:border-gray-600 inline-block bg-gray-100 dark:bg-gray-700">
                <canvas 
                  ref={canvasRef}
                  width={canvasWidth} 
                  height={canvasHeight}
                  className="max-w-full h-auto"
                  style={{
                    width: `${Math.min(canvasWidth * 3, 300)}px`,
                    height: `${Math.min(canvasHeight * 3, 300)}px`,
                    imageRendering: 'pixelated'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This image ({canvasWidth}x{canvasHeight}px) will be saved to the blockchain.
                {updateScope === 'area' && contiguousOwnedArea.length > 1 && (
                  <span className="block mt-1 font-semibold text-blue-600">
                    Covering {contiguousOwnedArea.length} pixel blocks ({areaDimensions.width}×{areaDimensions.height} grid)
                  </span>
                )}
              </p>
            </div>
          </>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-700 dark:bg-opacity-30 text-red-700 dark:text-red-200 text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading} // Only disable cancel if a destructive action is unstoppable
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-500 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 text-sm text-white rounded transition-colors ${
              isSubmitDisabled ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
