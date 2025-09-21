import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Download,
  ExternalLink
} from 'lucide-react';

interface PDFViewerProps {
  src: string;
  title?: string;
}

export function PDFViewer({ src, title = "PDF Viewer" }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title;
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };

  return (
    <div className="w-full ">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">Page</span>
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 px-2 py-1 text-sm border rounded"
              min="1"
              max={totalPages}
              aria-label="Page number"
              title="Enter page number"
            />
            <span className="text-sm">of {totalPages}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* PDF Display Area */}
      <div 
        ref={pdfRef}
        className={`bg-gray-100 overflow-auto ${isFullscreen ? 'h-screen' : 'h-[1500px]'}`}
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${100 / scale}%`,
          height: `${1500 / scale}px`
        } as React.CSSProperties}
      >
        <div className="w-full h-full flex items-center justify-center">
          <iframe
            src={src}
            width="100%"
            height="100%"
            className="border-0"
            title={title}
            onLoad={() => {
              // Simulate getting total pages (in real app, you'd get this from PDF.js)
              setTotalPages(50); // Mock value
            }}
          />
        </div>
      </div>
    </div>
  );
}
