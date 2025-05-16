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
    <div className={`${className} bg-black/20 rounded overflow-hidden relative h-[calc(100vh-10rem)]`}>
      <PixelMapViewer 
        onPixelClick={handlePixelClick} 
        className="w-full h-full" 
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        Mouse wheel = Zoom | Drag = Pan | Click = Select pixel
      </div>
    </div>
  );
}