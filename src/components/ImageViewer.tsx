import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string | null;
  lang: 'bn' | 'en';
  onUploadNew?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, lang }) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!imageUrl) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-dashed border-slate-700/80 text-center text-slate-400">
        <EyeOff className="w-12 h-12 mb-3 text-slate-600" />
        <p className="text-sm font-medium">
          {lang === 'bn' ? 'কোনো স্ক্যান কপি লোড করা নেই' : 'No scanned document loaded'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'bn' ? 'চালান স্ক্যান করুন বা ডেমো চালানটি লোড করুন' : 'Scan a challan or load sample document'}
        </p>
      </div>
    );
  }

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className={`relative bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full min-h-[420px]'
      }`}
    >
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            {lang === 'bn' ? 'মূল রিসিভ কপি (ভিজুয়াল চেক)' : 'Original Receive Copy'}
          </span>
          <span className="text-[11px] text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            title={lang === 'bn' ? 'জুম ইন' : 'Zoom In'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title={lang === 'bn' ? 'জুম আউট' : 'Zoom Out'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            title={lang === 'bn' ? 'ঘোরান' : 'Rotate'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title={lang === 'bn' ? 'রিসেট' : 'Reset'}
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            {lang === 'bn' ? 'রিসেট' : 'Reset'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'ছোট করুন' : 'বড় পর্দা'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Image Canvas */}
      <div
        className="relative flex-1 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-2"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="flex items-center justify-center max-w-full max-h-full select-none"
        >
          <img
            src={imageUrl}
            alt="Scanned Challan"
            className="max-h-[500px] object-contain rounded shadow-lg pointer-events-none"
          />
        </div>

        {/* Floating guidance helper */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-700/60 px-2.5 py-1 rounded-md text-[11px] text-slate-300 pointer-events-none">
          {lang === 'bn'
            ? '💡 হাতের লেখা অস্পষ্ট লাগলে জুম করে চালানের সাথে মিলিয়ে নিন'
            : '💡 Zoom & compare handwritten figures with the table'}
        </div>
      </div>
    </div>
  );
};
