'use client';

import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    fileUrl: string;
    onPageChange?: (page: number) => void;
    children?: React.ReactNode; // For annotation layer
}

export function PDFViewer({ fileUrl, onPageChange, children }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

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
                    <Document
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
                        <Page
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
                    </Document>
                </div>
            </div>
        </div>
    );
}
