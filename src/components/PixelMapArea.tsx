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
    <div className={`${className} panel overflow-hidden relative h-full max-h-[calc(100vh-10rem)]`}>
      <PixelMapViewer 
        onPixelClick={handlePixelClick} 
        className="w-full h-full" 
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-gray-800 text-xs p-2 rounded-md shadow-md">
        <div className="flex items-center space-x-1">
          <span className="bg-gray-200 px-1 rounded border border-gray-300">Mouse wheel</span> 
          <span>=</span> 
          <span>Zoom</span> 
          <span>|</span>
          <span className="bg-gray-200 px-1 rounded border border-gray-300">Drag</span> 
          <span>=</span> 
          <span>Pan</span> 
          <span>|</span>
          <span className="bg-gray-200 px-1 rounded border border-gray-300">Click</span> 
          <span>=</span> 
          <span>Select pixel</span>
        </div>
      </div>
    </div>
  );
}