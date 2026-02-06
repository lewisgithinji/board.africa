'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Check, X, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import type { ComplianceChecklist, ComplianceChecklistItem, ComplianceRegulation } from '@/lib/types/database.types';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-amber-100 text-amber-700',
};

interface ChecklistManagerProps {
    checklists: ComplianceChecklist[];
    regulations: ComplianceRegulation[];
}

export function ChecklistManager({ checklists: initialChecklists, regulations }: ChecklistManagerProps) {
    const [checklists, setChecklists] = useState(initialChecklists);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [useRegulation, setUseRegulation] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', regulation_id: '', due_date: '' });
    const [newItemTitle, setNewItemTitle] = useState('');
    const [addingItemTo, setAddingItemTo] = useState<string | null>(null);

    const getItems = (cl: ComplianceChecklist): ComplianceChecklistItem[] =>
        (cl as any).compliance_checklist_items || [];

    const handleCreate = async () => {
        if (!form.title && !form.regulation_id) { toast.error('Provide a title or select a regulation'); return; }
        setCreating(true);
        try {
            const body: Record<string, string> = {};
            if (form.regulation_id) {
                body.regulation_id = form.regulation_id;
                const reg = regulations.find(r => r.id === form.regulation_id);
                body.title = form.title || (reg ? `${reg.title} Compliance` : 'Compliance Checklist');
                if (reg) body.category = reg.category;
            } else {
                body.title = form.title;
            }
            if (form.description) body.description = form.description;
            if (form.due_date) body.due_date = form.due_date;

            const res = await fetch('/api/compliance/checklists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            setChecklists(prev => [created, ...prev]);
            setDialogOpen(false);
            setForm({ title: '', description: '', regulation_id: '', due_date: '' });
            setUseRegulation(false);
            toast.success('Checklist created');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create checklist');
        } finally {
            setCreating(false);
        }
    };

    const handleItemStatus = async (checklistId: string, itemId: string, status: string) => {
        try {
            const res = await fetch(`/api/compliance/checklists/${checklistId}/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(await res.text());
            setChecklists(prev => prev.map(cl =>
                cl.id === checklistId
                    ? { ...cl, compliance_checklist_items: getItems(cl).map(i => i.id === itemId ? { ...i, status } : i) } as any
                    : cl
            ));
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        }
    };

    const handleAddItem = async (checklistId: string) => {
        if (!newItemTitle.trim()) return;
        try {
            const res = await fetch(`/api/compliance/checklists/${checklistId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newItemTitle.trim() }),
            });
            if (!res.ok) throw new Error(await res.text());
            const item = await res.json();
            setChecklists(prev => prev.map(cl =>
                cl.id === checklistId
                    ? { ...cl, compliance_checklist_items: [...getItems(cl), item] } as any
                    : cl
            ));
            setNewItemTitle('');
            setAddingItemTo(null);
            toast.success('Item added');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add item');
        }
    };

    const handleChecklistStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/compliance/checklists/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(await res.text());
            setChecklists(prev => prev.map(cl => cl.id === id ? { ...cl, status } as any : cl));
            toast.success('Checklist updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Checklist
                </Button>
            </div>

            {checklists.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold">No checklists yet</p>
                        <p className="text-sm text-muted-foreground">Create a checklist manually or generate one from a regulation.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {checklists.map(cl => {
                        const items = getItems(cl);
                        const completedCount = items.filter(i => i.status === 'completed').length;
                        const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
                        const isExpanded = expandedId === cl.id;
                        const linkedReg = (cl as any).compliance_regulations;

                        return (
                            <Card key={cl.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : cl.id)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold">{cl.title}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[cl.status] || ''}`}>
                                                    {cl.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {linkedReg && (
                                                <p className="text-xs text-muted-foreground">
                                                    From: {linkedReg.title} ({linkedReg.country})
                                                </p>
                                            )}
                                            {items.length > 0 && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{completedCount}/{items.length}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {cl.status !== 'completed' && cl.status !== 'archived' && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleChecklistStatus(cl.id, 'completed'); }}>
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </Button>
                                            )}
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t space-y-1.5">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center gap-2 py-0.5">
                                                    <button
                                                        className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                                            item.status === 'completed'
                                                                ? 'bg-primary border-primary'
                                                                : item.status === 'skipped'
                                                                    ? 'bg-gray-200 border-gray-300'
                                                                    : 'border-muted hover:border-primary'
                                                        }`}
                                                        onClick={() => handleItemStatus(cl.id, item.id, item.status === 'completed' ? 'pending' : 'completed')}
                                                    >
                                                        {item.status === 'completed' && <Check className="h-2.5 w-2.5 text-white" />}
                                                        {item.status === 'skipped' && <X className="h-2.5 w-2.5 text-gray-500" />}
                                                    </button>
                                                    <span className={`text-sm flex-1 ${item.status === 'completed' ? 'line-through text-muted-foreground' : item.status === 'skipped' ? 'text-muted-foreground' : ''}`}>
                                                        {item.title}
                                                    </span>
                                                    {item.status !== 'skipped' && item.status !== 'completed' && (
                                                        <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => handleItemStatus(cl.id, item.id, 'skipped')}>
                                                            Skip
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {addingItemTo === cl.id ? (
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Input
                                                        value={newItemTitle}
                                                        onChange={e => setNewItemTitle(e.target.value)}
                                                        placeholder="New requirement..."
                                                        className="h-8 text-sm"
                                                        onKeyDown={e => e.key === 'Enter' && handleAddItem(cl.id)}
                                                        autoFocus
                                                    />
                                                    <Button size="sm" variant="outline" className="h-8" onClick={() => handleAddItem(cl.id)}>Add</Button>
                                                    <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingItemTo(null); setNewItemTitle(''); }}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <button className="text-xs text-primary hover:underline pt-1" onClick={() => setAddingItemTo(cl.id)}>
                                                    + Add requirement
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Compliance Checklist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseRegulation(false)}
                                className={`flex-1 text-xs p-2 rounded-md border text-center transition-colors ${!useRegulation ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground'}`}
                            >Manual</button>
                            <button
                                onClick={() => setUseRegulation(true)}
                                className={`flex-1 text-xs p-2 rounded-md border text-center transition-colors ${useRegulation ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground'}`}
                            >From Regulation</button>
                        </div>

                        {useRegulation && (
                            <div className="space-y-1.5">
                                <Label>Select Regulation</Label>
                                <Select value={form.regulation_id} onValueChange={v => setForm(f => ({ ...f, regulation_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Choose a regulation..." /></SelectTrigger>
                                    <SelectContent>
                                        {regulations.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.title} ({r.country})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.regulation_id && (
                                    <p className="text-xs text-muted-foreground">Requirements will be auto-populated from this regulation.</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label>Title {useRegulation && form.regulation_id && <span className="text-muted-foreground font-normal">(optional)</span>}</Label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Q1 AML Compliance Review" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Due Date (optional)</Label>
                            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description (optional)</Label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional context..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDialogOpen(false); setUseRegulation(false); }}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || (!form.title && !form.regulation_id)}>
                            {creating ? 'Creating...' : 'Create Checklist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
