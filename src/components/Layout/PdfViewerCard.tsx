"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Document, Page, pdfjs} from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// PDF.js worker (ESM)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type FitMode = "fit-width" | "actual-size";

interface PdfViewerCardProps {
  pdfUrl: string;
  title?: string;
}

export default function PdfViewerCard({ pdfUrl, title = "Tài liệu PDF" }: PdfViewerCardProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<FitMode>("fit-width");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null) as MutableRefObject<HTMLDivElement | null>;

  const computedScale = useMemo<number>(() => {
    if (fitMode !== "fit-width") return scale;
    return scale; // giữ cho đồng nhất, Page sẽ nhận width khi fit-width
  }, [fitMode, scale]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };
  const goPrev = () => setPageNumber((n) => Math.max(1, n - 1));
  const goNext = () => setPageNumber((n) => Math.min(numPages, n + 1));

  const zoomIn = () => setScale((s) => Math.min(2.5, parseFloat((s + 0.1).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(0.5, parseFloat((s - 0.1).toFixed(2))));
  const resetZoom = () => setScale(1.0);

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      const pad = 24; // padding ngang
      const w = containerRef.current.clientWidth - pad;
      setPageWidth(Math.max(320, w));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate" title={title}>
          {title}
        </h2>
        <div className="text-sm text-gray-500">
          {numPages > 0 ? `${numPages} trang` : isLoading ? "Đang tải…" : ""}
        </div>
      </div>

      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-950/70 text-gray-200">
          <button onClick={goPrev} disabled={pageNumber <= 1} className="px-3 py-1 rounded-md bg-gray-800 disabled:opacity-50">Prev</button>
          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => {
                const v = Number(e.target.value);
                const clamped = Math.min(Math.max(1, isNaN(v) ? 1 : v), numPages || 1);
                setPageNumber(clamped);
              }}
              className="w-16 px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-center"
              aria-label="Page number"
              title="Enter page number"
            />
            <span className="opacity-70">/ {numPages || 1}</span>
          </div>
          <div className="mx-3 h-5 w-px bg-gray-700" />
          <button onClick={zoomOut} className="px-3 py-1 rounded-md bg-gray-800">-</button>
          <span className="w-14 text-center text-sm">{Math.round(computedScale * 100)}%</span>
          <button onClick={zoomIn} className="px-3 py-1 rounded-md bg-gray-800">+</button>
          <button onClick={resetZoom} className="px-3 py-1 rounded-md bg-gray-800">Reset</button>
          <div className="mx-3 h-5 w-px bg-gray-700" />
          <button
            onClick={() => setFitMode((m) => (m === "fit-width" ? "actual-size" : "fit-width"))}
            className="px-3 py-1 rounded-md bg-gray-800"
          >
            {fitMode === "fit-width" ? "Actual size" : "Fit width"}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
            >
              Download
            </a>
            <button onClick={openInNewTab} className="px-3 py-1 rounded-md bg-gray-800">
              Open
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div ref={containerRef} className="h-[calc(100%-52px)] overflow-auto p-3">
          <div className="w-full flex justify-center">
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<PdfSkeleton />}>
              {fitMode === "fit-width" ? (
                <Page pageNumber={pageNumber} width={pageWidth} scale={computedScale} renderTextLayer renderAnnotationLayer />
              ) : (
                <Page pageNumber={pageNumber} scale={computedScale} renderTextLayer renderAnnotationLayer />
              )}
            </Document>
          </div>
        </div>
      </div>

      {/* Tuỳ chọn thay thế: nhúng PDF.js full viewer qua iframe */}
      {false && (
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
            className="w-full h-full"
            title="PDF.js Viewer"
          />
        </div>
      )}
    </div>
  );
}

function PdfSkeleton(): JSX.Element {
  return <div className="w-full h-[60vh] animate-pulse bg-gray-800/60 rounded-lg" />;
}
