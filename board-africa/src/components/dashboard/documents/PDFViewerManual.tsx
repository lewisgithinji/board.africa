'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerManualProps {
    fileUrl: string;
    onPageChange?: (page: number) => void;
    children?: React.ReactNode;
}

declare global {
    interface Window {
        pdfjsLib: any;
    }
}

export function PDFViewerManual({ fileUrl, onPageChange, children }: PDFViewerManualProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);
    const docRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load PDF.js from CDN
    useEffect(() => {
        if (window.pdfjsLib) {
            setPdfLibLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
        script.type = 'module';

        // We need to use a global variable or handle the module load
        // Since it's a module script, it won't populate window.pdfjsLib automatically in all browsers
        // So we use standard script with .js for global exposure usually, OR we import it.

        // Better approach: use import() inside useEffect, but bypassing webpack if possible?
        // Webpack will try to bundle import().

        // Let's use the non-module version (iife/viewer) if possible, OR just the standard build which often exposes a global if not in module mode.
        // Actually, unpkg /legacy/pdf.js is often better for this "manual global" approach.

        const legacyScript = document.createElement('script');
        legacyScript.src = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.min.js';

        legacyScript.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
            setPdfLibLoaded(true);
        };

        legacyScript.onerror = () => setError('Failed to load PDF library');
        document.head.appendChild(legacyScript);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Load Document
    useEffect(() => {
        if (!pdfLibLoaded || !fileUrl) return;

        const loadDoc = async () => {
            try {
                setIsLoading(true);
                const loadingTask = window.pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                docRef.current = pdf;
                setNumPages(pdf.numPages);
                setPageNumber(1);
                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError(err.message || 'Failed to load document');
                setIsLoading(false);
            }
        };

        loadDoc();
    }, [pdfLibLoaded, fileUrl]);

    // Render Page
    useEffect(() => {
        if (!docRef.current || !canvasRef.current || !pdfLibLoaded) return;

        const renderPage = async () => {
            try {
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                }

                const page = await docRef.current.getPage(pageNumber);

                // Calculate scale to fit width if needed, or use manual scale
                const viewport = page.getViewport({ scale });

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return; // Should not happen

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Update container dimensions for the overlay
                if (containerRef.current) {
                    containerRef.current.style.width = `${viewport.width}px`;
                    containerRef.current.style.height = `${viewport.height}px`;
                }

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;

                await renderTask.promise;
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error('Render error:', err);
                }
            }
        };

        renderPage();
    }, [docRef.current, pageNumber, scale, pdfLibLoaded]);


    const goToPrevPage = () => {
        const prev = Math.max(pageNumber - 1, 1);
        setPageNumber(prev);
        onPageChange?.(prev);
    }

    const goToNextPage = () => {
        const next = Math.min(pageNumber + 1, numPages);
        setPageNumber(next);
        onPageChange?.(next);
    }

    const zoomIn = () => setScale(p => Math.min(p + 0.2, 3.0));
    const zoomOut = () => setScale(p => Math.max(p - 0.2, 0.5));

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-full bg-slate-50 border border-slate-200 rounded-xl">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-red-700 font-medium">Failed to load PDF</p>
                <p className="text-slate-500 text-sm mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="min-w-[50px] justify-center">
                        {Math.round(scale * 100)}%
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3.0}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex justify-center p-6 bg-slate-100">
                <div className="relative shadow-2xl bg-white" ref={containerRef}>
                    {!pdfLibLoaded || isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-sm text-slate-500 animate-pulse">Loading Engine...</p>
                            </div>
                        </div>
                    ) : null}

                    <canvas ref={canvasRef} className="block" />

                    {/* Annotation Overlay */}
                    <div className="absolute inset-0 z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
