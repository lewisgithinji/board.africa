'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Clock,
    User,
    FileText,
    Target,
    ChevronDown,
    ChevronRight,
    Edit2,
    Trash2,
    Plus,
    CheckCircle2,
    Circle,
    Play,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AgendaItemWithDetails } from '@/lib/types/database.types';

interface AgendaItemCardProps {
    item: AgendaItemWithDetails;
    onEdit: (item: AgendaItemWithDetails) => void;
    onDelete: (id: string) => void;
    onAddSubItem: (parentId: string) => void;
    onStatusChange: (id: string, status: any) => void;
}

const itemTypeColors = {
    regular: 'bg-slate-100 text-slate-700 border-slate-200',
    consent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    presentation: 'bg-blue-50 text-blue-700 border-blue-100',
    vote: 'bg-purple-50 text-purple-700 border-purple-100',
    break: 'bg-orange-50 text-orange-700 border-orange-100',
};

const statusIcons = {
    pending: <Circle className="h-4 w-4 text-slate-400" />,
    in_progress: <Play className="h-4 w-4 text-blue-500 animate-pulse" />,
    completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    skipped: <X className="h-4 w-4 text-slate-300" />,
};

export function AgendaItemCard({
    item,
    onEdit,
    onDelete,
    onAddSubItem,
    onStatusChange
}: AgendaItemCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="group mb-2">
            <Card className="p-0 border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white">
                <div className="flex items-center gap-2 p-3">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600">
                        <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className={`${itemTypeColors[item.item_type]} text-[10px] px-1.5 py-0 uppercase font-bold tracking-tight`}>
                                {item.item_type}
                            </Badge>
                            <h4 className="font-bold text-slate-900 truncate flex-1 leading-tight">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 ml-auto">
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 text-[10px] font-bold">
                                    <Clock className="h-3 w-3" />
                                    {item.duration_minutes}m
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={() => onDelete(item.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                            {item.presenter && (
                                <div className="flex items-center gap-1.5 bg-slate-50/50 px-2 py-0.5 rounded-full border border-slate-100">
                                    <User className="h-3 w-3 text-slate-400" />
                                    <span>{item.presenter.full_name}</span>
                                </div>
                            )}
                            {item.document && (
                                <div className="flex items-center gap-1.5 bg-blue-50/30 px-2 py-0.5 rounded-full border border-blue-100/50 text-blue-600">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">{item.document.title}</span>
                                </div>
                            )}
                            {item.resolution && (
                                <div className="flex items-center gap-1.5 bg-purple-50/30 px-2 py-0.5 rounded-full border border-purple-100/50 text-purple-600">
                                    <Target className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">{item.resolution.title}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {item.description && (
                    <div className="px-10 pb-3 border-t border-slate-50 bg-slate-50/30 pt-2 text-[12px] text-slate-600 leading-relaxed italic border-dotted">
                        {item.description}
                    </div>
                )}
            </Card>
        </div>
    );
}
