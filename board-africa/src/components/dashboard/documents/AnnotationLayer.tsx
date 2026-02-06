'use client';

import { useState, useRef, useEffect } from 'react';
import type { DocumentAnnotation, AnnotationType } from '@/lib/types/database.types';
import { MessageSquare, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface AnnotationLayerProps {
    annotations: DocumentAnnotation[];
    activeTool: AnnotationType | null;
    activeColor: string;
    onAddAnnotation: (data: Partial<DocumentAnnotation>) => void;
    onDeleteAnnotation: (id: string) => void;
}

export function AnnotationLayer({
    annotations,
    activeTool,
    activeColor,
    onAddAnnotation,
    onDeleteAnnotation,
}: AnnotationLayerProps) {
    const layerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!activeTool || activeTool === 'note') return;

        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setIsDrawing(true);
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setStartPos({ x, y });
        setCurrentRect({ x, y, w: 0, h: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;

        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const curX = ((e.clientX - rect.left) / rect.width) * 100;
        const curY = ((e.clientY - rect.top) / rect.height) * 100;

        setCurrentRect({
            x: Math.min(startPos.x, curX),
            y: Math.min(startPos.y, curY),
            w: Math.abs(curX - startPos.x),
            h: Math.abs(curY - startPos.y),
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentRect) return;

        setIsDrawing(false);

        // If it's too small, ignore it
        if (currentRect.w < 1 && currentRect.h < 1) {
            setCurrentRect(null);
            return;
        }

        onAddAnnotation({
            annotation_type: activeTool as AnnotationType,
            position: currentRect as any,
            color: activeColor,
        });

        setCurrentRect(null);
    };

    const handlePageClick = (e: React.MouseEvent) => {
        if (activeTool !== 'note') return;

        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        onAddAnnotation({
            annotation_type: 'note',
            position: { x, y, width: 5, height: 5 } as any,
            color: activeColor,
        });
    };

    return (
        <div
            ref={layerRef}
            className={`absolute inset-0 z-20 ${activeTool ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handlePageClick}
        >
            {/* Render existing annotations */}
            {annotations.map((anno) => {
                const pos = anno.position as any;
                const isNote = anno.annotation_type === 'note';

                return (
                    <div
                        key={anno.id}
                        className="absolute group pointer-events-auto transition-all duration-200"
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            width: isNote ? 'auto' : `${pos.w}%`,
                            height: isNote ? 'auto' : `${pos.h}%`,
                        }}
                    >
                        {isNote ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="p-1 rounded-full shadow-md hover:scale-110 transition-transform bg-white border border-slate-200"
                                        style={{ color: anno.color || '#FFFF00' }}
                                    >
                                        <MessageSquare className="h-5 w-5 fill-current opacity-80" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3 shadow-xl border-slate-200">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => onDeleteAnnotation(anno.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed min-h-[40px] whitespace-pre-wrap">
                                            {anno.content || 'No content'}
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <div
                                className="h-full w-full relative transition-all duration-200"
                                style={{
                                    backgroundColor: anno.annotation_type === 'highlight' ? `${anno.color}40` : 'transparent',
                                    borderBottom: anno.annotation_type === 'underline' ? `2px solid ${anno.color}` : 'none',
                                    backgroundImage: anno.annotation_type === 'strikethrough' ? `linear-gradient(to top, transparent 45%, ${anno.color} 45%, ${anno.color} 55%, transparent 55%)` : 'none'
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAnnotation(anno.id);
                                    }}
                                    className="absolute -top-6 -right-2 bg-white/90 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2 hover:bg-white text-xs font-medium text-red-500 border border-red-100 ring-1 ring-slate-200 ring-inset"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Render drawing rectangle */}
            {currentRect && (
                <div
                    className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none rounded-sm ring-2 ring-blue-500/20"
                    style={{
                        left: `${currentRect.x}%`,
                        top: `${currentRect.y}%`,
                        width: `${currentRect.w}%`,
                        height: `${currentRect.h}%`,
                    }}
                />
            )}
        </div>
    );
}
