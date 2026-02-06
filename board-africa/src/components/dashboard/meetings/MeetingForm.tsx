'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/forms/LoadingButton';
import { FormSection } from '@/components/ui/forms/FormSection';
import { FormRow } from '@/components/ui/forms/FormRow';
import { createMeetingSchema, type MeetingFormData } from '@/lib/validations/meeting';
import type { BoardMember, Meeting } from '@/lib/types/database.types';

interface MeetingFormProps {
    meeting?: any;
    boardMembers: BoardMember[];
    onSuccess?: () => void;
}

const meetingTypes = [
    { value: 'regular', label: 'Regular Meeting' },
    { value: 'special', label: 'Special Meeting' },
    { value: 'emergency', label: 'Emergency Meeting' },
    { value: 'annual', label: 'Annual Meeting' },
];

const meetingStatuses = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function MeetingForm({ meeting, boardMembers, onSuccess }: MeetingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

    const isEditing = !!meeting;

    useEffect(() => {
        if (meeting?.meeting_attendees) {
            const memberIds = meeting.meeting_attendees
                .map((a: any) => a.board_member?.id || a.board_member_id)
                .filter(Boolean);
            setSelectedAttendees(memberIds);
        }
    }, [meeting]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MeetingFormData>({
        resolver: zodResolver(createMeetingSchema),
        defaultValues: meeting || {
            title: '',
            description: '',
            meeting_type: 'regular',
            meeting_date: '',
            duration_minutes: 60,
            location: '',
            status: 'upcoming',
            agenda: '',
            minutes: '',
            is_public: false,
        },
    });

    const meetingType = watch('meeting_type');
    const status = watch('status');

    async function onSubmit(data: MeetingFormData) {
        setIsSubmitting(true);

        try {
            const url = isEditing ? `/api/meetings/${meeting.id}` : '/api/meetings';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    attendees: selectedAttendees,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save meeting');
            }

            toast.success(isEditing ? 'Meeting updated successfully' : 'Meeting created successfully');

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/meetings');
            }
        } catch (error) {
            console.error('Error saving meeting:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save meeting');
        } finally {
            setIsSubmitting(false);
        }
    }

    function toggleAttendee(memberId: string) {
        setSelectedAttendees((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
            {/* Basic Information */}
            <FormSection
                title="Meeting Details"
                description="Basic information about the meeting"
            >
                <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 p-6 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <FormRow columns={2}>
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Meeting Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="e.g., Q4 Board Review"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meeting_type">
                                Meeting Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={meetingType}
                                onValueChange={(value) => setValue('meeting_type', value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {meetingTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.meeting_type && (
                                <p className="text-sm text-destructive">{errors.meeting_type.message}</p>
                            )}
                        </div>
                    </FormRow>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Brief description of the meeting purpose"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>
                </div>
            </FormSection>

            {/* Date, Time & Location */}
            <FormSection
                title="Schedule & Location"
                description="When and where the meeting will take place"
            >
                <FormRow columns={3}>
                    <div className="space-y-2">
                        <Label htmlFor="meeting_date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date & Time <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="meeting_date"
                            type="datetime-local"
                            {...register('meeting_date')}
                        />
                        {errors.meeting_date && (
                            <p className="text-sm text-destructive">{errors.meeting_date.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duration (minutes)
                        </Label>
                        <Input
                            id="duration_minutes"
                            type="number"
                            {...register('duration_minutes', { valueAsNumber: true })}
                            placeholder="60"
                        />
                        {errors.duration_minutes && (
                            <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {meetingStatuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </FormRow>

                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                    </Label>
                    <Input
                        id="location"
                        {...register('location')}
                        placeholder="e.g., Board Room, Zoom link, etc."
                    />
                    {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                </div>
            </FormSection>

            {/* Attendees */}
            {boardMembers.length > 0 && (
                <FormSection
                    title="Attendees"
                    description="Select board members to invite"
                    icon={Users}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {boardMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                            >
                                <Checkbox
                                    id={`attendee-${member.id}`}
                                    checked={selectedAttendees.includes(member.id)}
                                    onCheckedChange={() => toggleAttendee(member.id)}
                                />
                                <label
                                    htmlFor={`attendee-${member.id}`}
                                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {member.full_name}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({member.position})
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                </FormSection>
            )}

            {/* Agenda & Minutes */}
            <FormSection
                title="Agenda & Minutes"
                description="Meeting agenda and discussion notes"
            >
                <div className="space-y-2">
                    <Label htmlFor="agenda">Meeting Agenda</Label>
                    <Textarea
                        id="agenda"
                        {...register('agenda')}
                        placeholder="1. Call to Order
2. Approval of Minutes
3. Primary Reports
4. New Business"
                        rows={6}
                        className="resize-y"
                    />
                    <p className="text-xs text-muted-foreground">Outline the key topics to be discussed.</p>
                    {errors.agenda && (
                        <p className="text-sm text-destructive">{errors.agenda.message}</p>
                    )}
                </div>

                {isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="minutes">Minutes & Notes</Label>
                        <Textarea
                            id="minutes"
                            {...register('minutes')}
                            placeholder="Record key decisions, discussion points, and resolutions here..."
                            rows={8}
                            className="resize-y"
                        />
                        <p className="text-xs text-muted-foreground">These notes will be saved to the meeting record.</p>
                        {errors.minutes && (
                            <p className="text-sm text-destructive">{errors.minutes.message}</p>
                        )}
                    </div>
                )}
            </FormSection>

            {/* Settings */}
            <FormSection title="Settings" description="Additional meeting settings">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_public"
                        checked={watch('is_public')}
                        onCheckedChange={(checked) => setValue('is_public', checked as boolean)}
                    />
                    <label
                        htmlFor="is_public"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Show on public profile
                    </label>
                </div>
            </FormSection>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/meetings')}>
                    Cancel
                </Button>
                <LoadingButton type="submit" isLoading={isSubmitting}>
                    {meeting ? 'Update Meeting' : 'Create Meeting'}
                </LoadingButton>
            </div>
        </form>
    );
}
