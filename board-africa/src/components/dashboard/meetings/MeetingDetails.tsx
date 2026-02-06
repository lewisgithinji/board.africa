'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { generateMeetingMinutes } from '@/lib/actions/ai';
import { Plus, Check, X, Edit, Trash2, Calendar, Layout, User, MoreVertical, MessageSquare, Files, FileText, Sparkles, Bot, Clock, Video, Upload, Play, Loader2, MapPin, Users, History as LucideHistory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentList } from '@/components/dashboard/documents/DocumentList';
import { ResolutionList } from '@/components/dashboard/resolutions/ResolutionList';
import { AgendaBuilder } from './AgendaBuilder';
import { AddToCalendarButton } from './AddToCalendarButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/forms/LoadingButton';
import type { Meeting } from '@/lib/types/database.types';

interface MeetingDetailsProps {
    meeting: Meeting & {
        meeting_attendees?: any[];
        action_items?: any[];
        documents?: any[];
    };
    boardMembers: any[];
    onUpdate: () => void;
}

const statusColors = {
    upcoming: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm',
    in_progress: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm',
    completed: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm',
    cancelled: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
};

const attendanceColors = {
    invited: 'bg-blue-100 text-blue-800',
    attending: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    excused: 'bg-yellow-100 text-yellow-800',
};

const actionStatusColors = {
    pending: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm',
    in_progress: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm',
    completed: 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-sm',
    cancelled: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
};

export function MeetingDetails({ meeting: initialMeeting, boardMembers, onUpdate }: MeetingDetailsProps) {
    const [meeting, setMeeting] = useState(initialMeeting);
    const [newActionItem, setNewActionItem] = useState({ title: '', description: '', due_date: '', assigned_to: '' });
    const [isAddingAction, setIsAddingAction] = useState(false);
    const [isGeneratingMinutes, setIsGeneratingMinutes] = useState(false);
    const [manualTranscript, setManualTranscript] = useState(meeting.transcript || '');
    const [isUploading, setIsUploading] = useState(false);
    const [editingActionId, setEditingActionId] = useState<string | null>(null);
    const [editingActionData, setEditingActionData] = useState<any>(null);

    const meetingDate = new Date(meeting.meeting_date);

    async function updateAttendanceStatus(attendeeId: string, status: string) {
        try {
            const response = await fetch('/api/meeting-attendees', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attendee_id: attendeeId, attendance_status: status }),
            });

            if (!response.ok) throw new Error('Failed to update attendance');

            toast.success('Attendance updated');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update attendance');
        }
    }

    async function addActionItem() {
        if (!newActionItem.title.trim()) {
            toast.error('Action item title is required');
            return;
        }

        setIsAddingAction(true);
        try {
            const response = await fetch('/api/action-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meeting_id: meeting.id,
                    title: newActionItem.title,
                    description: newActionItem.description,
                    due_date: newActionItem.due_date || null,
                    assigned_to: newActionItem.assigned_to === 'none' ? null : newActionItem.assigned_to || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to create action item');

            toast.success('Action item created');
            // Reset form
            setNewActionItem({ title: '', description: '', due_date: '', assigned_to: '' });
            onUpdate();
        } catch (error) {
            toast.error('Failed to create action item');
        } finally {
            setIsAddingAction(false);
        }
    }

    async function updateActionStatus(actionId: string, status: string) {
        try {
            const response = await fetch('/api/action-items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: actionId, status }),
            });

            if (!response.ok) throw new Error('Failed to update action item');

            toast.success('Action item updated');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update action item');
        }
    }

    async function deleteActionItem(itemId: string) {
        try {
            const response = await fetch(`/api/action-items?id=${itemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete action item');

            toast.success('Action item deleted');
            onUpdate();
        } catch (error) {
            toast.error('Failed to delete action item');
        }
    }

    function startEditingAction(item: any) {
        setEditingActionId(item.id);
        setEditingActionData({
            title: item.title,
            description: item.description || '',
            due_date: item.due_date || '',
            assigned_to: item.assigned_to || 'none',
            status: item.status
        });
    }

    async function handleUpdateAction() {
        if (!editingActionData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        try {
            const response = await fetch('/api/action-items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingActionId,
                    ...editingActionData,
                    assigned_to: editingActionData.assigned_to === 'none' ? null : editingActionData.assigned_to
                }),
            });

            if (!response.ok) throw new Error('Failed to update action item');

            toast.success('Action item updated');
            setEditingActionId(null);
            onUpdate();
        } catch (error) {
            toast.error('Failed to update action item');
        }
    }

    async function handleGenerateAI() {
        if (!manualTranscript.trim()) {
            toast.error('Please provide a transcript or notes to summarize');
            return;
        }

        setIsGeneratingMinutes(true);
        try {
            const response = await fetch(`/api/meetings/${meeting.id}/ai/minutes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: manualTranscript }),
            });

            if (!response.ok) throw new Error('Failed to generate minutes');

            const result = await response.json();
            toast.success('AI Minutes generated!');
            onUpdate(); // Refresh meeting data
        } catch (error) {
            toast.error('AI generation failed');
        } finally {
            setIsGeneratingMinutes(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (limit 25MB for OpenAI)
        if (file.size > 25 * 1024 * 1024) {
            toast.error("File is too large. Max size is 25MB.");
            return;
        }

        setIsUploading(true);
        toast.info(`Uploading and transcribing ${file.name}...`);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`/api/meetings/${meeting.id}/ai/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Transcription failed');
            }

            const { transcript } = await response.json();
            setManualTranscript(transcript);
            toast.success("Transcription complete!");
            onUpdate();
        } catch (error: any) {
            console.error('[Upload Error]:', error);
            toast.error(error.message || "Failed to process audio file");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{meeting.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[meeting.status]}>
                            {meeting.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{meeting.meeting_type}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 font-bold animate-pulse hover:animate-none"
                        asChild
                    >
                        <Link href={`/meetings/${meeting.id}/room`}>
                            <Video className="h-5 w-5 mr-2" />
                            JOIN VIDEO ROOM
                        </Link>
                    </Button>
                    <AddToCalendarButton meeting={meeting} />
                    <Button asChild>
                        <Link href={`/meetings/${meeting.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Meeting Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {meeting.description && (
                        <div>
                            <h4 className="font-medium mb-1">Description</h4>
                            <p className="text-muted-foreground">{meeting.description}</p>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{format(meetingDate, 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {format(meetingDate, 'p')}
                                {meeting.duration_minutes && ` (${meeting.duration_minutes} min)`}
                            </span>
                        </div>
                        {meeting.location && (
                            <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{meeting.location}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="agenda" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="agenda">Agenda</TabsTrigger>
                    <TabsTrigger value="attendees">
                        Attendees ({meeting.meeting_attendees?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                        Actions ({meeting.action_items?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="minutes">Minutes</TabsTrigger>
                </TabsList>

                {/* Agenda Tab */}
                <TabsContent value="agenda" className="space-y-6">
                    <AgendaBuilder meetingId={meeting.id} boardMembers={boardMembers} />

                    {meeting.agenda && (
                        <Card className="border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <LucideHistory className="h-4 w-4" />
                                    Legacy Text Agenda
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <pre className="whitespace-pre-wrap font-sans text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{meeting.agenda}</pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Attendees Tab */}
                <TabsContent value="attendees" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Attendees</CardTitle>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/meetings/${meeting.id}/edit`}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {meeting.meeting_attendees && meeting.meeting_attendees.length > 0 ? (
                                <div className="space-y-3">
                                    {meeting.meeting_attendees.map((attendee: any) => (
                                        <div
                                            key={attendee.id}
                                            className="flex items-center justify-between p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={attendee.board_member?.avatar_url} />
                                                    <AvatarFallback>
                                                        {attendee.board_member?.full_name?.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{attendee.board_member?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {attendee.board_member?.position}
                                                    </p>
                                                </div>
                                            </div>
                                            <Select
                                                value={attendee.attendance_status}
                                                onValueChange={(value) => updateAttendanceStatus(attendee.id, value)}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="invited">Invited</SelectItem>
                                                    <SelectItem value="attending">Attending</SelectItem>
                                                    <SelectItem value="absent">Absent</SelectItem>
                                                    <SelectItem value="excused">Excused</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No attendees added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Action Items Tab */}
                <TabsContent value="actions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Action Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add New Action Item */}
                            <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                                <h4 className="font-medium text-sm">Add Action Item</h4>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Action item title..."
                                        value={newActionItem.title}
                                        onChange={(e) =>
                                            setNewActionItem({ ...newActionItem, title: e.target.value })
                                        }
                                    />
                                    <Textarea
                                        placeholder="Description (optional)..."
                                        value={newActionItem.description}
                                        onChange={(e) =>
                                            setNewActionItem({ ...newActionItem, description: e.target.value })
                                        }
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={newActionItem.due_date}
                                            onChange={(e) =>
                                                setNewActionItem({ ...newActionItem, due_date: e.target.value })
                                            }
                                            className="w-1/3"
                                        />
                                        <Select
                                            value={newActionItem.assigned_to}
                                            onValueChange={(value) =>
                                                setNewActionItem({ ...newActionItem, assigned_to: value })
                                            }
                                        >
                                            <SelectTrigger className="w-1/3">
                                                <SelectValue placeholder="Assign to..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Unassigned</SelectItem>
                                                {boardMembers.map((member: any) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <LoadingButton
                                            onClick={addActionItem}
                                            isLoading={isAddingAction}
                                            size="sm"
                                            className="w-1/3"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </LoadingButton>
                                    </div>
                                </div>
                            </div>

                            {/* Existing Action Items */}
                            {meeting.action_items && meeting.action_items.length > 0 ? (
                                <div className="space-y-4">
                                    {meeting.action_items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="p-4 rounded-xl border bg-card/50 transition-all hover:border-primary/20"
                                        >
                                            {editingActionId === item.id ? (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={editingActionData.title}
                                                            onChange={(e) => setEditingActionData({ ...editingActionData, title: e.target.value })}
                                                            placeholder="Action title"
                                                            className="h-9"
                                                        />
                                                        <Select
                                                            value={editingActionData.status}
                                                            onValueChange={(value) => setEditingActionData({ ...editingActionData, status: value })}
                                                        >
                                                            <SelectTrigger className="w-[140px] h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Textarea
                                                        value={editingActionData.description}
                                                        onChange={(e) => setEditingActionData({ ...editingActionData, description: e.target.value })}
                                                        placeholder="Description (optional)"
                                                        className="min-h-[60px] text-sm"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="date"
                                                            value={editingActionData.due_date}
                                                            onChange={(e) => setEditingActionData({ ...editingActionData, due_date: e.target.value })}
                                                            className="h-9 w-full"
                                                        />
                                                        <Select
                                                            value={editingActionData.assigned_to}
                                                            onValueChange={(value) => setEditingActionData({ ...editingActionData, assigned_to: value })}
                                                        >
                                                            <SelectTrigger className="h-9 w-full">
                                                                <SelectValue placeholder="Assign to..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">Unassigned</SelectItem>
                                                                {boardMembers.map((member: any) => (
                                                                    <SelectItem key={member.id} value={member.id}>
                                                                        {member.full_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex gap-1 pl-2">
                                                            <Button size="sm" variant="default" className="h-9 bg-green-600 hover:bg-green-700" onClick={handleUpdateAction}>
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-9" onClick={() => setEditingActionId(null)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                                                            <Badge className={actionStatusColors[item.status as keyof typeof actionStatusColors]}>
                                                                {item.status.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-4 pt-1">
                                                            {item.due_date && (
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Due: {format(new Date(item.due_date), 'PP')}
                                                                </p>
                                                            )}
                                                            {item.board_member && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Avatar className="h-5 w-5 border border-primary/10">
                                                                        {item.board_member.avatar_url && <AvatarImage src={item.board_member.avatar_url} />}
                                                                        <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                                                            {item.board_member.full_name.substring(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                        {item.board_member.full_name}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => startEditingAction(item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => deleteActionItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No action items yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Resolutions Tab */}
                <TabsContent value="resolutions" className="space-y-4">
                    <ResolutionList
                        meetingId={meeting.id}
                        boardMembers={boardMembers}
                        onUpdate={onUpdate}
                    />
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Files className="h-5 w-5" />
                                Meeting Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DocumentList meetingId={meeting.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Minutes Tab */}
                <TabsContent value="minutes" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Meeting Minutes</CardTitle>
                                {meeting.minutes && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/meetings/${meeting.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Manual Edit
                                        </Link>
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {meeting.minutes ? (
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                                            {meeting.minutes}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                                        <p className="mt-4 text-muted-foreground">
                                            No minutes recorded yet.
                                        </p>
                                        <p className="text-sm text-muted-foreground/60">
                                            Upload a transcript or enter notes to generate them with AI.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    AI Minutes Assistant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Meeting Transcript / Notes</Label>
                                    <Textarea
                                        placeholder="Paste meeting transcript or notes here..."
                                        className="min-h-[200px] text-sm"
                                        value={manualTranscript}
                                        onChange={(e) => setManualTranscript(e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        AI works best with full transcripts. GPT-4o will extract action items and summaries.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Or upload meeting recording (MP3, MP4, M4A)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="file"
                                                accept="audio/*,video/*"
                                                className="hidden"
                                                id="meeting-audio-upload"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <Label
                                                htmlFor="meeting-audio-upload"
                                                className={`flex items-center justify-center gap-2 h-9 border-2 border-dashed rounded-md text-xs cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Upload className="h-3 w-3 text-primary" />
                                                )}
                                                {isUploading ? 'Processing...' : 'Choose Recording...'}
                                            </Label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Whisper AI will convert your recording to text automatically.
                                    </p>
                                </div>

                                <LoadingButton
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                                    onClick={handleGenerateAI}
                                    isLoading={isGeneratingMinutes}
                                    disabled={!manualTranscript || isUploading}
                                >
                                    <Bot className="h-4 w-4 mr-2" />
                                    Generate Minutes
                                </LoadingButton>

                                {meeting.ai_summary && (
                                    <div className="pt-4 border-t mt-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                                            <Badge variant="secondary">AI Summary</Badge>
                                        </h4>
                                        <p className="text-sm text-muted-foreground line-clamp-4 italic border-l-2 pl-3">
                                            {meeting.ai_summary}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
