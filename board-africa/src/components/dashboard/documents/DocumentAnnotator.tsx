'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
// import { PDFViewer } from './PDFViewer'; // Original - fails with SES
// import { PDFViewerSafe } from './PDFViewerSafe'; // SES-safe version with CSS
import { PDFViewerManual } from './PDFViewerManual'; // Manual implementation bypassing Webpack for PDF.js
import { PDFDebugPanel } from './PDFDebugPanel';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationLayer } from './AnnotationLayer';
import type { DocumentAnnotation, AnnotationType, Document } from '@/lib/types/database.types';
import { Loader2, AlertCircle, X, MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface DocumentAnnotatorProps {
    document: Document;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function DocumentAnnotator({ document }: DocumentAnnotatorProps) {
    const [selectedTool, setSelectedTool] = useState<AnnotationType | null>(null);
    const [selectedColor, setSelectedColor] = useState('#FFFF00');
    const [currentPage, setCurrentPage] = useState(1);

    // For the note dialog
    const [pendingNote, setPendingNote] = useState<Partial<DocumentAnnotation> | null>(null);
    const [noteContent, setNoteContent] = useState('');

    const { data, error, mutate, isLoading } = useSWR<{ annotations: DocumentAnnotation[] }>(
        `/api/documents/${document.id}/annotations`,
        fetcher
    );

    const annotations = data?.annotations || [];
    const pageAnnotations = annotations.filter(a => a.page_number === currentPage);

    const handleAddAnnotation = async (annoData: Partial<DocumentAnnotation>) => {
        if (annoData.annotation_type === 'note') {
            setPendingNote(annoData);
            setNoteContent('');
            return;
        }

        saveAnnotation({
            ...annoData,
            page_number: currentPage,
        });
    };

    const saveAnnotation = async (data: Partial<DocumentAnnotation>) => {
        try {
            const res = await fetch(`/api/documents/${document.id}/annotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to save annotation');

            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAnnotation = async (id: string) => {
        try {
            const res = await fetch(`/api/documents/${document.id}/annotations/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete annotation');

            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveNote = () => {
        if (pendingNote) {
            saveAnnotation({
                ...pendingNote,
                page_number: currentPage,
                content: noteContent,
            });
            setPendingNote(null);
            setNoteContent('');
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-900">Failed to load annotations</h3>
                    <p className="text-red-700 text-sm">Please refresh the page to try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-[85vh] transition-all duration-500 ease-in-out">
            {/* Overlay Toolbar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-500">
                <AnnotationToolbar
                    selectedType={selectedTool}
                    onTypeChange={setSelectedTool}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                />
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-2xl transition-all duration-300">
                <PDFViewerManual
                    fileUrl={document.file_url}
                    onPageChange={setCurrentPage}
                >
                    <AnnotationLayer
                        annotations={pageAnnotations}
                        activeTool={selectedTool}
                        activeColor={selectedColor}
                        onAddAnnotation={handleAddAnnotation}
                        onDeleteAnnotation={handleDeleteAnnotation}
                    />
                </PDFViewerManual>
            </div>

            {/* Debug Panel - Development Only */}
            {process.env.NODE_ENV === 'development' && <PDFDebugPanel />}

            {/* Note Input Dialog */}
            <Dialog open={!!pendingNote} onOpenChange={(o) => !o && setPendingNote(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-white text-xl">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                Add Annotation Note
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Your Comment</label>
                            <Textarea
                                placeholder="Type your observation or note here..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="min-h-[150px] resize-none border-slate-200 focus:ring-blue-500/20 focus:border-blue-500/40 rounded-xl p-4 text-slate-700 leading-relaxed shadow-inner"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="bg-slate-50 p-4 px-6 flex items-center justify-between border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setPendingNote(null)}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl px-6"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            disabled={!noteContent.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-600/20 flex items-center gap-2 group transition-all duration-200 active:scale-95"
                        >
                            <Save className="h-4 w-4 transition-transform group-hover:rotate-12" />
                            <span>Save Note</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
