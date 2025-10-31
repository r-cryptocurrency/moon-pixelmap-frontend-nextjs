import PixelMapViewer from './PixelMapViewer';

interface PixelMapAreaProps {
  className?: string;
  onPixelSelect?: (x: number, y: number) => void;
  onAreaSelect?: (pixels: { x: number; y: number }[]) => void;
  selectionMode: boolean;
}

export default function PixelMapArea({ className = '', onPixelSelect, onAreaSelect, selectionMode }: PixelMapAreaProps) {
  
  const handlePixelClick = (x: number, y: number) => {
    if (onPixelSelect) {
      onPixelSelect(x, y);
    }
  };
  
  const handleAreaSelect = (pixels: { x: number; y: number }[]) => {
    console.log(`Selected ${pixels.length} pixels`);
    if (onAreaSelect) {
      onAreaSelect(pixels);
    }
  };

  return (
    <>
      <div className={`${className} panel relative h-full max-h-[calc(100vh-10rem)]`}>
        {/* Map container with overflow hidden */}
        <div className="overflow-hidden h-full w-full">
          <PixelMapViewer 
            onPixelClick={handlePixelClick}
            onAreaSelect={handleAreaSelect}
            selectionMode={selectionMode}
            className="w-full h-full" 
          />
        </div>
      
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm text-gray-800 text-xs p-3 rounded-md shadow-md">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <span className="bg-gray-200 px-2 py-0.5 rounded border border-gray-300">Mouse wheel</span> 
              <span>=</span> 
              <span>Zoom</span> 
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center space-x-1">
              <span className="bg-gray-200 px-2 py-0.5 rounded border border-gray-300">Drag</span> 
              <span>=</span> 
              <span>Pan</span> 
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center space-x-1">
              <span className="bg-gray-200 px-2 py-0.5 rounded border border-gray-300">Click</span> 
              <span>=</span> 
              <span>Select pixel</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}