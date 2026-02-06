'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { ComplianceCalendarEvent, ComplianceRegulation } from '@/lib/types/database.types';

const EVENT_TYPE_LABELS: Record<string, string> = {
    deadline: 'Deadline',
    review: 'Review',
    filing: 'Filing',
    training: 'Training',
    audit: 'Audit',
};

type EventGroup = 'overdue' | 'this_week' | 'upcoming' | 'completed';

function classifyEvent(event: ComplianceCalendarEvent): EventGroup {
    if (event.status === 'completed' || event.status === 'cancelled') return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(event.due_date + 'T00:00:00');
    if (due < today) return 'overdue';
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    if (due <= weekEnd) return 'this_week';
    return 'upcoming';
}

interface ComplianceCalendarProps {
    events: ComplianceCalendarEvent[];
    regulations: ComplianceRegulation[];
}

export function ComplianceCalendar({ events: initialEvents, regulations }: ComplianceCalendarProps) {
    const [events, setEvents] = useState(initialEvents);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', event_type: 'deadline', due_date: '', regulation_id: '' });

    const grouped = useMemo(() => {
        const g: Record<EventGroup, ComplianceCalendarEvent[]> = { overdue: [], this_week: [], upcoming: [], completed: [] };
        events.forEach(e => g[classifyEvent(e)].push(e));
        return g;
    }, [events]);

    const handleCreate = async () => {
        if (!form.title || !form.due_date) { toast.error('Title and due date are required'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/compliance/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description || undefined,
                    event_type: form.event_type,
                    due_date: form.due_date,
                    regulation_id: form.regulation_id || undefined,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            setEvents(prev => [...prev, created]);
            setDialogOpen(false);
            setForm({ title: '', description: '', event_type: 'deadline', due_date: '', regulation_id: '' });
            toast.success('Event created');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    const handleComplete = async (id: string) => {
        try {
            const res = await fetch(`/api/compliance/calendar/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            });
            if (!res.ok) throw new Error(await res.text());
            setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'completed' } : e));
            toast.success('Marked as completed');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/compliance/calendar/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            setEvents(prev => prev.filter(e => e.id !== id));
            toast.success('Event deleted');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const EventCard = ({ event }: { event: ComplianceCalendarEvent }) => {
        const linkedReg = (event as any).compliance_regulations;
        return (
            <Card className={event.status === 'overdue' || classifyEvent(event) === 'overdue' ? 'border-red-200 bg-red-50/50' : ''}>
                <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">{event.title}</span>
                                <Badge variant="outline" className="text-xs">{EVENT_TYPE_LABELS[event.event_type]}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Due: {new Date(event.due_date + 'T00:00:00').toLocaleDateString()}</span>
                                {linkedReg && <span className="ml-1">&#8212; {linkedReg.title}</span>}
                            </div>
                            {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {event.status !== 'completed' && event.status !== 'cancelled' && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleComplete(event.id)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const GroupHeader = ({ label, count, icon, color }: { label: string; count: number; icon: React.ReactNode; color: string }) => (
        <div className={`flex items-center gap-2 ${color}`}>
            {icon}
            <h3 className="text-xs font-semibold uppercase tracking-wide">{label}</h3>
            <Badge variant="secondary" className="text-xs">{count}</Badge>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Event
                </Button>
            </div>

            {events.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold">No calendar events</p>
                        <p className="text-sm text-muted-foreground">Track compliance deadlines and milestones here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-5">
                    {grouped.overdue.length > 0 && (
                        <div className="space-y-2">
                            <GroupHeader label="Overdue" count={grouped.overdue.length} icon={<AlertCircle className="h-4 w-4 text-red-600" />} color="text-red-600" />
                            {grouped.overdue.map(e => <EventCard key={e.id} event={e} />)}
                        </div>
                    )}
                    {grouped.this_week.length > 0 && (
                        <div className="space-y-2">
                            <GroupHeader label="This Week" count={grouped.this_week.length} icon={<Clock className="h-4 w-4 text-amber-600" />} color="text-amber-600" />
                            {grouped.this_week.map(e => <EventCard key={e.id} event={e} />)}
                        </div>
                    )}
                    {grouped.upcoming.length > 0 && (
                        <div className="space-y-2">
                            <GroupHeader label="Upcoming" count={grouped.upcoming.length} icon={<Calendar className="h-4 w-4 text-primary" />} color="text-primary" />
                            {grouped.upcoming.map(e => <EventCard key={e.id} event={e} />)}
                        </div>
                    )}
                    {grouped.completed.length > 0 && (
                        <div className="space-y-2">
                            <GroupHeader label="Completed" count={grouped.completed.length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} color="text-green-600" />
                            {grouped.completed.map(e => <EventCard key={e.id} event={e} />)}
                        </div>
                    )}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Calendar Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Title</Label>
                            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Report Filing Deadline" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Type</Label>
                                <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                                            <SelectItem key={k} value={k}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Due Date</Label>
                                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Linked Regulation (optional)</Label>
                            <Select value={form.regulation_id} onValueChange={v => setForm(f => ({ ...f, regulation_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a regulation..." /></SelectTrigger>
                                <SelectContent>
                                    {regulations.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.title} ({r.country})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description (optional)</Label>
                            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional details..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !form.title || !form.due_date}>
                            {creating ? 'Creating...' : 'Add Event'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
