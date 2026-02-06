'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Import react-pdf CSS (safe - doesn't trigger pdfjs-dist loading)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Dynamically import react-pdf with SSR disabled and SES-safe loading
const DynamicDocument = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Initializing PDF Engine...</p>
      </div>
    )
  }
);

const DynamicPage = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

interface PDFViewerSafeProps {
  fileUrl: string;
  onPageChange?: (page: number) => void;
  children?: React.ReactNode;
}

export function PDFViewerSafe({ fileUrl, onPageChange, children }: PDFViewerSafeProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfJsInitialized, setPdfJsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const workerInitRef = useRef(false);

  // Initialize PDF.js worker in a SES-safe way
  useEffect(() => {
    // Don't use ref to prevent duplicate initialization - rely on state instead
    if (pdfJsInitialized) return;

    const initPdfWorker = async () => {
      try {
        console.log('[PDF Viewer] Starting initialization...');

        // Detect SES lockdown
        const sesDetected = typeof (globalThis as any).lockdown === 'function' ||
                           Object.isFrozen(Object.prototype);

        if (sesDetected) {
          console.warn('[PDF Viewer] SES lockdown detected. Using isolated worker strategy.');
        } else {
          console.log('[PDF Viewer] No SES lockdown detected.');
        }

        console.log('[PDF Viewer] Importing pdfjs-dist...');
        // Dynamic import to avoid SES interference during module evaluation
        const pdfjsLib = await import('pdfjs-dist');
        console.log('[PDF Viewer] pdfjs-dist imported. Version:', pdfjsLib.version);

        // Use CDN worker (runs in separate context, unaffected by SES)
        const pdfjsVersion = pdfjsLib.version || '4.4.168';
        const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

        console.log('[PDF Viewer] Setting worker URL:', workerUrl);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        console.log('[PDF Viewer] ✅ Initialization complete!');
        setPdfJsInitialized(true);
      } catch (error) {
        console.error('[PDF Viewer] ❌ Failed to initialize:', error);
        console.error('[PDF Viewer] Error details:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    // Minimal delay - just enough to ensure component is mounted
    const timer = setTimeout(initPdfWorker, 10);
    return () => clearTimeout(timer);
  }, [pdfJsInitialized]); // Add dependency to prevent re-runs

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const goToPrevPage = () => {
    const prevPage = Math.max(pageNumber - 1, 1);
    setPageNumber(prevPage);
    onPageChange?.(prevPage);
  };

  const goToNextPage = () => {
    const nextPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(nextPage);
    onPageChange?.(nextPage);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Show initialization error
  if (initError) {
    return (
      <div className="flex flex-col h-full bg-slate-100 rounded-lg overflow-hidden border border-red-200 shadow-sm">
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">PDF Engine Initialization Failed</h3>
          <p className="text-sm text-slate-600 text-center max-w-md mb-4">{initError}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Wait for PDF.js to initialize
  if (!pdfJsInitialized) {
    return (
      <div className="flex flex-col h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600 text-sm font-medium">Initializing PDF Engine...</p>
          <p className="text-slate-400 text-xs mt-2">Configuring secure environment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-all duration-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 min-w-[80px] justify-center">
            <span className="text-sm font-medium">{pageNumber}</span>
            <span className="text-sm text-slate-400">/</span>
            <span className="text-sm text-slate-500">{numPages || '--'}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="hover:bg-slate-100"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-2 py-0.5 text-xs font-mono min-w-[50px] justify-center">
            {Math.round(scale * 100)}%
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="hover:bg-slate-100"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-auto flex justify-center p-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="relative shadow-2xl bg-white rounded-sm ring-1 ring-slate-200 transition-all duration-300 ring-offset-4 ring-offset-slate-100">
          <DynamicDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-20 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 text-sm font-medium animate-pulse">Loading Document...</p>
              </div>
            }
            error={
              <div className="p-10 text-center">
                <p className="text-red-500 font-medium">Failed to load PDF</p>
                <p className="text-slate-400 text-sm mt-1">Please check your connection or file URL.</p>
              </div>
            }
          >
            <DynamicPage
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              className="transition-all duration-300"
            />

            {/* Custom Overlay for Annotations */}
            <div className="absolute inset-0 pointer-events-none">
              {children}
            </div>
          </DynamicDocument>
        </div>
      </div>
    </div>
  );
}
