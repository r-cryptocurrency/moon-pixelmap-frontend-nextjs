import PixelMapViewer from './PixelMapViewer';

interface PixelMapAreaProps {
  className?: string;
  onPixelSelect?: (x: number, y: number) => void;
}

export default function PixelMapArea({ className = '', onPixelSelect }: PixelMapAreaProps) {
  const handlePixelClick = (x: number, y: number) => {
    if (onPixelSelect) {
      onPixelSelect(x, y);
    }
  };

  return (
    <div className={`${className} bg-gray-800 bg-opacity-80 rounded-lg overflow-hidden relative shadow-lg h-[calc(100vh-10rem)]`}>
      <PixelMapViewer 
        onPixelClick={handlePixelClick} 
        className="w-full h-full" 
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs p-2 rounded-md shadow-md">
        <div className="flex items-center space-x-1">
          <span className="bg-gray-700 px-1 rounded">Mouse wheel</span> 
          <span>=</span> 
          <span>Zoom</span> 
          <span>|</span>
          <span className="bg-gray-700 px-1 rounded">Drag</span> 
          <span>=</span> 
          <span>Pan</span> 
          <span>|</span>
          <span className="bg-gray-700 px-1 rounded">Click</span> 
          <span>=</span> 
          <span>Select pixel</span>
        </div>
      </div>
    </div>
  );
}