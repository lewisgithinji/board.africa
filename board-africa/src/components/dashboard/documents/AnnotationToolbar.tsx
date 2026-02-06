'use client';

import { Highlighter, MessageSquare, Underline, Strikethrough, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { AnnotationType } from '@/lib/types/database.types';

interface AnnotationToolbarProps {
    selectedType: AnnotationType | null;
    onTypeChange: (type: AnnotationType | null) => void;
    selectedColor: string;
    onColorChange: (color: string) => void;
}

const COLORS = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#00BFFF' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Orange', value: '#FFA500' },
];

export function AnnotationToolbar({
    selectedType,
    onTypeChange,
    selectedColor,
    onColorChange,
}: AnnotationToolbarProps) {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-lg border border-slate-200 z-50 px-4">
                <ToggleGroup
                    type="single"
                    value={selectedType || ''}
                    onValueChange={(v: string) => onTypeChange(v as AnnotationType || null)}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="highlight" aria-label="Highlight">
                                <span className="p-1 rounded" style={{ backgroundColor: selectedType === 'highlight' ? selectedColor : 'transparent' }}>
                                    <Palette className="h-4 w-4" />
                                </span>
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Highlight</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="note" aria-label="Comment">
                                <MessageSquare className="h-4 w-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Add Note</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="underline" aria-label="Underline">
                                <Underline className="h-4 w-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Underline</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="strikethrough" aria-label="Strikethrough">
                                <Strikethrough className="h-4 w-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Strikethrough</TooltipContent>
                    </Tooltip>
                </ToggleGroup>

                <div className="w-px h-6 bg-slate-200" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Change Color">
                            <div
                                className="h-4 w-4 rounded-full border border-slate-300 shadow-inner"
                                style={{ backgroundColor: selectedColor }}
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-2 grid grid-cols-5 gap-1">
                        {COLORS.map((color) => (
                            <DropdownMenuItem
                                key={color.value}
                                className="p-0 h-6 w-6 rounded-full cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
                                onClick={() => onColorChange(color.value)}
                            >
                                <div
                                    className="h-full w-full"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {selectedType && (
                    <>
                        <div className="w-px h-6 bg-slate-200" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-500 hover:text-slate-900 px-2 h-7"
                            onClick={() => onTypeChange(null)}
                        >
                            Cancel
                        </Button>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}
