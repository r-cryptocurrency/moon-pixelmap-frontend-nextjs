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
      <div className={`${className} p-4 bg-black/20 rounded`}>
        <p className="text-center text-white/70">Select a pixel to view information</p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`${className} p-4 bg-black/20 rounded`}>
        <p className="text-center text-white/70">Loading pixel ({x}, {y}) information...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`${className} p-4 bg-black/20 rounded`}>
        <h3 className="text-lg font-bold mb-2">Pixel ({x}, {y})</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Show pixel information
  return (
    <div className={`${className} p-4 bg-black/20 rounded overflow-hidden`}>
      <h3 className="text-lg font-bold mb-2">Pixel ({x}, {y})</h3>
      
      {pixelInfo ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/70">Owner:</span>
            <span className="text-white font-mono truncate ml-2">
              {pixelInfo.owner ? pixelInfo.owner.substring(0, 6) + '...' + pixelInfo.owner.substring(pixelInfo.owner.length - 4) : 'None'}
            </span>
          </div>
          
          {pixelInfo.color && (
            <div className="flex justify-between items-center">
              <span className="text-white/70">Color:</span>
              <div className="flex items-center gap-2">
                <span>{pixelInfo.color}</span>
                <div 
                  className="w-4 h-4 border border-white/30" 
                  style={{ backgroundColor: pixelInfo.color }}
                />
              </div>
            </div>
          )}
          
          {pixelInfo.lastUpdated && (
            <div className="flex justify-between">
              <span className="text-white/70">Last Updated:</span>
              <span>{new Date(pixelInfo.lastUpdated).toLocaleString()}</span>
            </div>
          )}
          
          {pixelInfo.metadata && Object.keys(pixelInfo.metadata).length > 0 && (
            <div className="mt-4">
              <div className="text-white/70 mb-1">Metadata:</div>
              <pre className="bg-black/30 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(pixelInfo.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-white/70">No information available for this pixel</p>
      )}
    </div>
  );
}
