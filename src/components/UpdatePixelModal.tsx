'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { updatePixel } from '@/services/api';

interface UpdatePixelModalProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdatePixelModal({ 
  x, 
  y, 
  isOpen, 
  onClose,
  onSuccess
}: UpdatePixelModalProps) {
  const { address } = useWallet();
  const [imageData, setImageData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setImageData('');
      onClose();
    }
  };
  
  // Initialize the canvas with a color
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setImageData(canvas.toDataURL('image/png'));
      }
    }
  }, [selectedColor]);
  
  // Update the canvas when color changes
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setImageData(canvas.toDataURL('image/png'));
      }
    }
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }
    
    if (!imageData) {
      setError('No image data');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await updatePixel(x, y, address, imageData, { color: selectedColor });
      
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error updating pixel:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pixel');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize canvas when component mounts
  useEffect(() => {
    if (isOpen) {
      setTimeout(initializeCanvas, 100);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Update Pixel ({x}, {y})</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color</label>
          <input 
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-10 w-20 cursor-pointer"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <div className="border border-gray-300 p-2">
            <canvas 
              ref={canvasRef}
              width={100}
              height={100}
              className="w-full aspect-square"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 text-sm text-white rounded ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Pixel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
