import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fetchPixelMap, fetchPixelsData } from '@/services/api';

interface PixelMapViewerProps {
  onPixelClick?: (x: number, y: number) => void;
  onAreaSelect?: (pixels: { x: number; y: number }[]) => void;
  selectionMode?: boolean;
  className?: string;
}

interface OwnedPixelCoord {
  x: number;
  y: number;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Animation colors for highlight
const highlightAnimationColors = [
  'rgba(255, 0, 0, 0.9)', // Red
  'rgba(0, 255, 0, 0.9)', // Green
  'rgba(0, 0, 255, 0.9)', // Blue
  'rgba(255, 255, 0, 0.9)', // Yellow
  'rgba(255, 0, 255, 0.9)', // Magenta
];

export default function PixelMapViewer({ onPixelClick, onAreaSelect, selectionMode = false, className = '' }: PixelMapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10); // Default size of each pixel
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const { address, isConnected } = useAccount();
  const [userOwnedPixels, setUserOwnedPixels] = useState<OwnedPixelCoord[]>([]);
  const [highlightedPixelBorders, setHighlightedPixelBorders] = useState<Map<string, { top: boolean, bottom: boolean, left: boolean, right: boolean }>>(new Map());
  
  // Multi-select feature state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  
  const PIXEL_MAP_SIZE = 100; // 100x100 pixel grid

  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  
  // Clear selection when mode changes
  useEffect(() => {
    if (!selectionMode) {
      setSelectionRect(null);
      setIsSelecting(false);
      setSelectionStart(null);
    }
  }, [selectionMode]);
  
  // Effect for highlight color animation
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentColorIndex(prevIndex => (prevIndex + 1) % highlightAnimationColors.length);
    }, 500); // Change color every 500ms

    return () => clearInterval(animationInterval);
  }, []);
  
  // Center the pixel map in the canvas - use ref to avoid dependency issues
  const centerMapRef = useRef<() => void>(() => {});
  
  // Update centerMapRef when pixelSize changes
  useEffect(() => {
    centerMapRef.current = () => {
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
    };
  }, [pixelSize]);

  // Initialize the pixel map - only runs once on mount
  useEffect(() => {
    const loadPixelMap = async (preservePosition = false) => {
      try {
        setLoading(true);
        const imageBlob = await fetchPixelMap();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        const img = new Image();
        img.onload = () => {
          setImageObj(img);
          setLoading(false);
          
          // Center the map only on initial load (not on refresh)
          if (!preservePosition && canvasRef.current) {
            centerMapRef.current();
          }
          // If preservePosition is true, we keep the current pan state (no setPan call needed)
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
    
    loadPixelMap(false); // Initial load, center the map
    
    // Listen for pixel update events to refresh the map
    const handlePixelsUpdated = () => {
      console.log('Pixels updated, refreshing map...');
      loadPixelMap(true); // Preserve position on refresh
    };
    
    window.addEventListener('pixelsUpdated', handlePixelsUpdated);
    
    return () => {
      window.removeEventListener('pixelsUpdated', handlePixelsUpdated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount
  
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
        ctx.strokeStyle = highlightAnimationColors[currentColorIndex]; // Use animated color
        ctx.lineWidth = Math.max(2, pixelSize * 0.25); // Further increased thickness

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

    // Draw selection rectangle if in selection mode
    if (selectionRect) {
      const minX = Math.min(selectionRect.startX, selectionRect.endX);
      const maxX = Math.max(selectionRect.startX, selectionRect.endX);
      const minY = Math.min(selectionRect.startY, selectionRect.endY);
      const maxY = Math.max(selectionRect.startY, selectionRect.endY);
      
      const rectX = pan.x + minX * pixelSize;
      const rectY = pan.y + minY * pixelSize;
      const rectWidth = (maxX - minX + 1) * pixelSize;
      const rectHeight = (maxY - minY + 1) * pixelSize;
      
      // Draw bright yellow/green overlay for selection
      ctx.fillStyle = 'rgba(34, 197, 94, 0.4)'; // Green with 40% opacity
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
      
      // Draw thick animated border
      ctx.strokeStyle = 'rgb(22, 163, 74)'; // Solid green border
      ctx.lineWidth = Math.max(4, pixelSize * 0.3);
      ctx.setLineDash([10, 5]); // Dashed line
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
      ctx.setLineDash([]); // Reset dash
      
      // Draw size label with better visibility
      const pixelCount = (maxX - minX + 1) * (maxY - minY + 1);
      const label = `${maxX - minX + 1}×${maxY - minY + 1} (${pixelCount} blocks)`;
      const fontSize = Math.max(14, pixelSize * 1.2);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgb(22, 163, 74)';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = rectX + rectWidth / 2;
      const labelY = rectY + rectHeight / 2;
      ctx.strokeText(label, labelX, labelY);
      ctx.fillText(label, labelX, labelY);
    }

  }, [loading, imageObj, pan, pixelSize, userOwnedPixels, highlightedPixelBorders, currentColorIndex, selectionRect]);

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
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const startPos = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      };
      setClickStart(startPos);
      setHasMoved(false);
      
      if (selectionMode) {
        // In selection mode, start selecting pixels
        const pixelX = Math.floor((e.clientX - rect.left - pan.x) / pixelSize);
        const pixelY = Math.floor((e.clientY - rect.top - pan.y) / pixelSize);
        
        console.log('Selection mode mouseDown:', { pixelX, pixelY, selectionMode });
        
        if (pixelX >= 0 && pixelX < PIXEL_MAP_SIZE && pixelY >= 0 && pixelY < PIXEL_MAP_SIZE) {
          setIsSelecting(true);
          setSelectionStart({ x: pixelX, y: pixelY });
          setSelectionRect({ startX: pixelX, startY: pixelY, endX: pixelX, endY: pixelY });
          console.log('Started selection at:', { x: pixelX, y: pixelY });
        }
      } else {
        // In pan mode, set up for dragging
        setDragStart({
          x: e.clientX - pan.x,
          y: e.clientY - pan.y
        });
      }
    }
  };  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) { // Left button is being pressed
      const dx = Math.abs(e.clientX - clickStart.x);
      const dy = Math.abs(e.clientY - clickStart.y);
      
      // Always mark as moved if we've moved beyond threshold
      if (dx > dragThreshold || dy > dragThreshold) {
        setHasMoved(true);
      }
      
      if (selectionMode && isSelecting && selectionStart) {
        // In selection mode, update the selection rectangle
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const pixelX = Math.floor((e.clientX - rect.left - pan.x) / pixelSize);
          const pixelY = Math.floor((e.clientY - rect.top - pan.y) / pixelSize);
          
          // Clamp to grid bounds
          const clampedX = Math.max(0, Math.min(PIXEL_MAP_SIZE - 1, pixelX));
          const clampedY = Math.max(0, Math.min(PIXEL_MAP_SIZE - 1, pixelY));
          
          setSelectionRect({
            startX: selectionStart.x,
            startY: selectionStart.y,
            endX: clampedX,
            endY: clampedY
          });
        }
      } else if (!selectionMode) {
        // In pan mode ONLY, allow dragging
        if (dx > dragThreshold || dy > dragThreshold) {
          setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          });
        }
      }
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const clickDuration = Date.now() - clickStart.time;
    
    if (selectionMode && isSelecting && selectionRect) {
      // Finalize selection
      const minX = Math.min(selectionRect.startX, selectionRect.endX);
      const maxX = Math.max(selectionRect.startX, selectionRect.endX);
      const minY = Math.min(selectionRect.startY, selectionRect.endY);
      const maxY = Math.max(selectionRect.startY, selectionRect.endY);
      
      // Generate array of all pixels in the rectangle
      const selectedPixels: { x: number; y: number }[] = [];
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          selectedPixels.push({ x, y });
        }
      }
      
      // Call the area select callback
      if (onAreaSelect && selectedPixels.length > 0) {
        onAreaSelect(selectedPixels);
      }
      
      setIsSelecting(false);
      setSelectionStart(null);
      // Keep selectionRect to show the selected area
    } else if (!selectionMode && !hasMoved && clickDuration < clickThreshold && onPixelClick) {
      // Single pixel click (pan mode)
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
    
    setHasMoved(false);
  };
  
  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: WheelEvent) => {
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
  }, [pixelSize, pan]);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [pixelSize, pan, handleWheel]);
  
  return (
    <div ref={containerRef} className={`relative ${className} touch-none`} style={{ touchAction: 'none' }}>
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
      
      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className="absolute top-16 left-2 z-20 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pulse">
          🎯 Drag to select pixels
        </div>
      )}
      
      {/* Clear Selection Button */}
      {selectionRect && !isSelecting && (
        <div className="absolute top-16 right-2 z-20">
          <button
            onClick={() => setSelectionRect(null)}
            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm shadow-lg font-medium"
          >
            ✕ Clear Selection
          </button>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className={`w-full h-full bg-gray-200 dark:bg-gray-800 ${
          selectionMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { 
          // setDragging(false); // Removed as setDragging is not defined
          if (isSelecting) {
            setIsSelecting(false);
          }
        }}
      />
      
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-1.5 py-0.5 text-xs rounded-sm">
        Zoom: {pixelSize.toFixed(1)}x
      </div>
    </div>
  );
}
