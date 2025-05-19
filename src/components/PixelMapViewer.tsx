import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fetchPixelMap, fetchPixelsData, PixelData } from '@/services/api';

interface PixelMapViewerProps {
  onPixelClick?: (x: number, y: number) => void;
  className?: string;
}

interface OwnedPixelCoord {
  x: number;
  y: number;
}

export default function PixelMapViewer({ onPixelClick, className = '' }: PixelMapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10); // Default size of each pixel
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const { address, isConnected } = useAccount();
  const [userOwnedPixels, setUserOwnedPixels] = useState<OwnedPixelCoord[]>([]);
  const [highlightedPixelBorders, setHighlightedPixelBorders] = useState<Map<string, { top: boolean, bottom: boolean, left: boolean, right: boolean }>>(new Map());
  
  const PIXEL_MAP_SIZE = 100; // 100x100 pixel grid
  
  // Initialize the pixel map
  useEffect(() => {
    const loadPixelMap = async () => {
      try {
        setLoading(true);
        const imageBlob = await fetchPixelMap();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        const img = new Image();
        img.onload = () => {
          setImageObj(img);
          setLoading(false);
          
          // After image is loaded, center the map
          if (canvasRef.current) {
            centerMap();
          }
        };
        img.onerror = () => {
          setError('Failed to load pixel map image');
          setLoading(false);
        };
        img.src = imageUrl;
        
        return () => URL.revokeObjectURL(imageUrl);
      } catch (err) {
        console.error('Error loading pixel map:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };
    
    loadPixelMap();
  }, []);
  
  const fetchAndProcessUserPixels = useCallback(async () => {
    if (!isConnected || !address) {
      setUserOwnedPixels([]);
      setHighlightedPixelBorders(new Map());
      return;
    }
    try {
      const allPixels = await fetchPixelsData();
      const owned = allPixels
        .filter(p => p.owner.toLowerCase() === address.toLowerCase())
        .map(p => ({ x: p.x, y: p.y }));
      setUserOwnedPixels(owned);
      calculateHighlightBorders(owned);
    } catch (err) {
      console.error("Error fetching user's pixels for highlighting:", err);
      setUserOwnedPixels([]);
      setHighlightedPixelBorders(new Map());
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchAndProcessUserPixels();
    // Refresh highlights if user/connection changes
    const interval = setInterval(fetchAndProcessUserPixels, 30000); // Periodically refresh owned pixels
    return () => clearInterval(interval);
  }, [fetchAndProcessUserPixels]);

  const calculateHighlightBorders = (owned: OwnedPixelCoord[]) => {
    const ownedSet = new Set(owned.map(p => `${p.x},${p.y}`));
    const borders = new Map<string, { top: boolean, bottom: boolean, left: boolean, right: boolean }>();

    for (const pixel of owned) {
      const key = `${pixel.x},${pixel.y}`;
      borders.set(key, {
        top: !ownedSet.has(`${pixel.x},${pixel.y - 1}`),
        bottom: !ownedSet.has(`${pixel.x},${pixel.y + 1}`),
        left: !ownedSet.has(`${pixel.x - 1},${pixel.y}`),
        right: !ownedSet.has(`${pixel.x + 1},${pixel.y}`),
      });
    }
    setHighlightedPixelBorders(borders);
  };
  
  // Center the pixel map in the canvas
  const centerMap = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the position to center the map
    const mapWidth = PIXEL_MAP_SIZE * pixelSize;
    const mapHeight = PIXEL_MAP_SIZE * pixelSize;
    
    // Ensure the map is centered
    const centerX = Math.max(0, (canvasWidth - mapWidth) / 2);
    const centerY = Math.max(0, (canvasHeight - mapHeight) / 2);
    
    setPan({ x: centerX, y: centerY });
  }, [pixelSize]);
  
  // Draw the pixel map when image is loaded or when pan/zoom changes
  useEffect(() => {
    if (!canvasRef.current || !imageObj || loading) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false; // Keep pixel art sharp
    
    // Draw the image with current pan and zoom
    ctx.drawImage(
      imageObj, 
      pan.x, pan.y, 
      PIXEL_MAP_SIZE * pixelSize, 
      PIXEL_MAP_SIZE * pixelSize
    );
    
    // Draw grid lines (optional)
    if (pixelSize > 5) { // Only draw grid when zoomed in enough
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.5; // Thinner grid lines
      
      // Draw vertical lines
      for (let i = 0; i <= PIXEL_MAP_SIZE; i++) {
        const xPos = pan.x + i * pixelSize;
        ctx.beginPath();
        ctx.moveTo(xPos, pan.y);
        ctx.lineTo(xPos, pan.y + PIXEL_MAP_SIZE * pixelSize);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= PIXEL_MAP_SIZE; i++) {
        const yPos = pan.y + i * pixelSize;
        ctx.beginPath();
        ctx.moveTo(pan.x, yPos);
        ctx.lineTo(pan.x + PIXEL_MAP_SIZE * pixelSize, yPos);
        ctx.stroke();
      }
    }

    // Draw highlights for owned pixels
    if (userOwnedPixels.length > 0 && pixelSize > 2) { // Only draw if visible
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)'; // Tailwind blue-500
        ctx.lineWidth = Math.max(1, pixelSize * 0.1); // Make line thicker as zoom increases

        highlightedPixelBorders.forEach((borders, key) => {
            const [pxStr, pyStr] = key.split(',');
            const px = parseInt(pxStr);
            const py = parseInt(pyStr);

            const drawX = pan.x + px * pixelSize;
            const drawY = pan.y + py * pixelSize;

            if (borders.top) {
                ctx.beginPath();
                ctx.moveTo(drawX, drawY);
                ctx.lineTo(drawX + pixelSize, drawY);
                ctx.stroke();
            }
            if (borders.bottom) {
                ctx.beginPath();
                ctx.moveTo(drawX, drawY + pixelSize);
                ctx.lineTo(drawX + pixelSize, drawY + pixelSize);
                ctx.stroke();
            }
            if (borders.left) {
                ctx.beginPath();
                ctx.moveTo(drawX, drawY);
                ctx.lineTo(drawX, drawY + pixelSize);
                ctx.stroke();
            }
            if (borders.right) {
                ctx.beginPath();
                ctx.moveTo(drawX + pixelSize, drawY);
                ctx.lineTo(drawX + pixelSize, drawY + pixelSize);
                ctx.stroke();
            }
        });
    }

  }, [loading, imageObj, pan, pixelSize, userOwnedPixels, highlightedPixelBorders]);

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current; // Capture canvasRef.current
    const container = containerRef.current; // Capture containerRef.current

    const handleResize = () => {
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // No automatic re-centering here.
        // The main drawing useEffect (which depends on pan, pixelSize, imageObj)
        // will handle redrawing the content correctly.
      }
    };
    
    handleResize(); // Initial sizing
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array: runs once to set up and clean up.
          // handleResize will use the closure-captured canvas and container.
          // This ensures canvas dimensions are updated on window resize.
  
  // Handle mouse events for pan and click
  const [clickStart, setClickStart] = useState({ x: 0, y: 0, time: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const dragThreshold = 5; // Minimum pixels moved to be considered a drag
  const clickThreshold = 200; // Maximum milliseconds for a click
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
      const startPos = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      };
      setClickStart(startPos);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
      setHasMoved(false);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) { // Left button is being pressed
      const dx = Math.abs(e.clientX - clickStart.x);
      const dy = Math.abs(e.clientY - clickStart.y);
      
      // If moved beyond threshold, it's a drag
      if (dx > dragThreshold || dy > dragThreshold) {
        setDragging(true);
        setHasMoved(true);
        
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const clickDuration = Date.now() - clickStart.time;
        
    if (!hasMoved && clickDuration < clickThreshold && onPixelClick) {
      // Calculate which pixel was clicked
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.floor((e.clientX - rect.left - pan.x) / pixelSize);
        const y = Math.floor((e.clientY - rect.top - pan.y) / pixelSize);
        
        // Make sure the click is within bounds
        if (x >= 0 && x < PIXEL_MAP_SIZE && y >= 0 && y < PIXEL_MAP_SIZE) {
          onPixelClick(x, y);
        }
      }
    }
    setDragging(false); // Always reset dragging on mouse up
    setHasMoved(false); // Reset hasMoved
  };
  
  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Get cursor position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom factor
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newPixelSize = Math.max(1, Math.min(100, pixelSize * zoomFactor)); // Increased max zoom
    
    // Calculate new pan position to zoom toward mouse position
    const newPanX = mouseX - (mouseX - pan.x) * (newPixelSize / pixelSize);
    const newPanY = mouseY - (mouseY - pan.y) * (newPixelSize / pixelSize);
    
    setPixelSize(newPixelSize);
    setPan({ x: newPanX, y: newPanY });
  };
  
  return (
    <div ref={containerRef} className={`relative ${className} touch-none`} style={{ touchAction: 'none' }}> {/* Added touch-none for better mobile experience */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="text-white text-sm">Loading pixel map...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="text-red-500 text-sm p-3 bg-black bg-opacity-70 rounded">
            Error: {error}
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-gray-200 dark:bg-gray-800 cursor-grab active:cursor-grabbing" // Updated cursor classes
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDragging(false); }}
        onWheel={handleWheel}
      />
      
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-1.5 py-0.5 text-xs rounded-sm">
        Zoom: {pixelSize.toFixed(1)}x
      </div>
    </div>
  );
}
