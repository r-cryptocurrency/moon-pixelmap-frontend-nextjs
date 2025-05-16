import { useEffect, useState } from 'react';
import { PixelData, fetchPixelData } from '@/services/api';

interface PixelInfoCardProps {
  x?: number;
  y?: number;
  className?: string;
}

export default function PixelInfoCard({ x, y, className = '' }: PixelInfoCardProps) {
  const [pixelInfo, setPixelInfo] = useState<PixelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPixelData = async () => {
      if (x === undefined || y === undefined) {
        setPixelInfo(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPixelData(x, y);
        setPixelInfo(data);
      } catch (err) {
        console.error('Error loading pixel data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pixel data');
        setPixelInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadPixelData();
  }, [x, y]);

  // Show placeholder when no pixel is selected
  if (x === undefined || y === undefined) {
    return (
      <div className={`${className} panel p-0 h-full`}>
        <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Pixel Info</h3>
        <div className="p-4">
          <p className="text-center text-xs">Select a pixel to view information</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`${className} panel p-0 h-full`}>
        <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Pixel ({x}, {y})</h3>
        <div className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
            <p className="text-center text-xs text-gray-600">Loading information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`${className} panel p-0 h-full`}>
        <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Pixel ({x}, {y})</h3>
        <div className="p-4">
          <div className="flex items-center space-x-2 bg-red-100 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show pixel information
  return (
    <div className={`${className} panel p-0 overflow-hidden h-full`}>
      <h3 className="text-sm font-bold px-4 py-2 border-b border-gray-300">Pixel ({x}, {y})</h3>
      <div className="p-3">
      
      {pixelInfo ? (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Owner:</span>
            <span className="text-gray-800 font-mono truncate ml-2">
              {pixelInfo.owner ? pixelInfo.owner.substring(0, 6) + '...' + pixelInfo.owner.substring(pixelInfo.owner.length - 4) : 'None'}
            </span>
          </div>
          
          {pixelInfo.color && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Color:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-800">{pixelInfo.color}</span>
                <div 
                  className="w-4 h-4 border border-gray-400 rounded-sm shadow-inner" 
                  style={{ backgroundColor: pixelInfo.color }}
                />
              </div>
            </div>
          )}
          
          {pixelInfo.lastUpdated && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-800">{new Date(pixelInfo.lastUpdated).toLocaleString()}</span>
            </div>
          )}
          
          {pixelInfo.metadata && Object.keys(pixelInfo.metadata).length > 0 && (
            <div className="mt-3">
              <div className="text-gray-600 mb-1 text-xs">Metadata:</div>
              <pre className="bg-gray-100 p-2 rounded-md text-xs text-gray-700 overflow-auto max-h-32 border border-gray-300 shadow-inner">
                {JSON.stringify(pixelInfo.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-gray-600">No information available for this pixel</p>
      )}
      </div>
    </div>
  );
}
