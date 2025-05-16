import { useEffect, useRef, useState } from 'react';
import { fetchPixelMap } from '@/services/api';

interface PixelMapViewerProps {
  onPixelClick?: (x: number, y: number) => void;
  className?: string;
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
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
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
  
  // Center the pixel map in the canvas
  const centerMap = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the position to center the map
    const mapWidth = PIXEL_MAP_SIZE * pixelSize;
    const mapHeight = PIXEL_MAP_SIZE * pixelSize;
    
    const centerX = (canvasWidth - mapWidth) / 2;
    const centerY = (canvasHeight - mapHeight) / 2;
    
    setPan({ x: centerX, y: centerY });
  };
  
  // Draw the pixel map when image is loaded or when pan/zoom changes
  useEffect(() => {
    if (!canvasRef.current || !imageObj || loading) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
      ctx.lineWidth = 1;
      
      // Draw vertical lines
      for (let x = 0; x <= PIXEL_MAP_SIZE; x++) {
        const pixelX = pan.x + x * pixelSize;
        ctx.beginPath();
        ctx.moveTo(pixelX, pan.y);
        ctx.lineTo(pixelX, pan.y + PIXEL_MAP_SIZE * pixelSize);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = 0; y <= PIXEL_MAP_SIZE; y++) {
        const pixelY = pan.y + y * pixelSize;
        ctx.beginPath();
        ctx.moveTo(pan.x, pixelY);
        ctx.lineTo(pan.x + PIXEL_MAP_SIZE * pixelSize, pixelY);
        ctx.stroke();
      }
    }
  }, [loading, imageObj, pan, pixelSize]);

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Set canvas size to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        setCanvasSize({
          width: canvas.width,
          height: canvas.height
        });
        
        // If image is already loaded, center it when resizing
        if (imageObj && !dragging) {
          centerMap();
        }
      }
    };
    
    handleResize(); // Initial sizing
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageObj]);
  
  // Handle mouse events for pan and click
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
      setDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) {
      setDragging(false);
    } else if (onPixelClick) {
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
    const newPixelSize = Math.max(1, Math.min(50, pixelSize * zoomFactor));
    
    // Calculate new pan position to zoom toward mouse position
    const newPanX = mouseX - (mouseX - pan.x) * (newPixelSize / pixelSize);
    const newPanY = mouseY - (mouseY - pan.y) * (newPixelSize / pixelSize);
    
    setPixelSize(newPixelSize);
    setPan({ x: newPanX, y: newPanY });
  };
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="text-white text-lg">Loading pixel map...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="text-red-500 text-lg p-4 bg-black bg-opacity-70 rounded">
            Error: {error}
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black/10 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setDragging(false)}
        onWheel={handleWheel}
      />
      
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 text-xs rounded">
        Zoom: {Math.round(pixelSize * 10) / 10}x
      </div>
    </div>
  );
}
