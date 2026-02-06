'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    Plus,
    ListTodo,
    Loader2,
    Clock,
    AlertCircle,
    FileText,
    History,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgendaItemCard } from './AgendaItemCard';
import { AgendaItemForm } from './AgendaItemForm';
import type { AgendaItemWithDetails, BoardMember, AgendaItemInsert } from '@/lib/types/database.types';
import { toast } from 'sonner';

interface AgendaBuilderProps {
    meetingId: string;
    boardMembers: BoardMember[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AgendaBuilder({ meetingId, boardMembers }: AgendaBuilderProps) {
    const { data, error, mutate, isLoading } = useSWR<{ agendaItems: AgendaItemWithDetails[] }>(
        `/api/meetings/${meetingId}/agenda`,
        fetcher
    );

    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<AgendaItemWithDetails | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const items = data?.agendaItems || [];

    const totalDuration = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
    }, [items]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);

            // Optimistic update
            mutate({ agendaItems: newItems }, false);

            try {
                const bulkData = newItems.map((item, index) => ({
                    id: item.id,
                    order_index: index,
                }));

                const res = await fetch(`/api/meetings/${meetingId}/agenda`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bulkData),
                });

                if (!res.ok) throw new Error('Failed to reorder items');

                toast.success('Agenda reordered');
            } catch (err) {
                toast.error('Failed to save order');
                mutate(); // Revert on error
            }
        }
    };

    const handleAddOrUpdate = async (formData: AgendaItemInsert) => {
        try {
            const url = editingItem
                ? `/api/meetings/${meetingId}/agenda/${editingItem.id}`
                : `/api/meetings/${meetingId}/agenda`;

            const method = editingItem ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    order_index: editingItem ? editingItem.order_index : items.length,
                }),
            });

            if (!res.ok) throw new Error('Failed to save agenda item');

            toast.success(editingItem ? 'Item updated' : 'Item added');
            setIsAdding(false);
            setEditingItem(null);
            mutate();
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agenda item?')) return;

        try {
            const res = await fetch(`/api/meetings/${meetingId}/agenda/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete item');

            toast.success('Item deleted');
            mutate();
        } catch (err) {
            toast.error('Failed to delete item');
        }
    };

    const handleExport = () => {
        if (items.length === 0) {
            toast.error('Agenda is empty');
            return;
        }

        const lines = [
            `# MEETING AGENDA`,
            `Total Duration: ${totalDuration} minutes`,
            `Items: ${items.length}`,
            '',
            ...items.map((item, index) => {
                const presenter = item.presenter ? ` (Presenter: ${item.presenter.full_name})` : '';
                return `${index + 1}. [${item.duration_minutes}m] ${item.title}${presenter}\n   ${item.description || ''}\n`;
            })
        ];

        const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting_${meetingId}_agenda.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Agenda exported to Markdown');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading structured agenda...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <p className="font-medium">Failed to load agenda items. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <ListTodo className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Structured Agenda</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <Clock className="h-3 w-3" />
                                {totalDuration} Minutes Total
                            </span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">•</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{items.length} Items</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="flex-1 sm:flex-none rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsAdding(true)}
                        disabled={isAdding || !!editingItem}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-blue-600/20 gap-2 font-bold transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        New Agenda Item
                    </Button>
                </div>
            </div>

            {(isAdding || editingItem) && (
                <AgendaItemForm
                    meetingId={meetingId}
                    initialData={editingItem || {}}
                    boardMembers={boardMembers}
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingItem(null);
                    }}
                />
            )}

            {items.length === 0 && !isAdding && !editingItem && (
                <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-12 w-12 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Build your meeting agenda</h4>
                    <p className="text-slate-500 max-w-sm mb-8">
                        Organize your meeting with structured items, time allocations, and linked documents for better governance.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setIsAdding(true)}
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all font-bold px-8 h-12"
                    >
                        Start Adding Items
                    </Button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {items.map((item) => (
                            <AgendaItemCard
                                key={item.id}
                                item={item}
                                onEdit={setEditingItem}
                                onDelete={handleDelete}
                                onAddSubItem={() => { }} // TODO: Sub-items in Phase 8.1
                                onStatusChange={() => { }} // TODO: Live status in Phase 8.2
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
