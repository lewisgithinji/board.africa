'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createResolutionSchema, type CreateResolutionInput } from '@/lib/validations/resolution';
import type { ResolutionWithVotes } from '@/lib/types/database.types';

interface ResolutionFormProps {
    meetingId: string;
    resolution?: ResolutionWithVotes | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function ResolutionForm({ meetingId, resolution, onClose, onSuccess }: ResolutionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!resolution;

    const form = useForm<CreateResolutionInput>({
        resolver: zodResolver(createResolutionSchema),
        defaultValues: {
            meeting_id: meetingId,
            title: resolution?.title || '',
            description: resolution?.description || '',
            voting_type: resolution?.voting_type || 'simple_majority',
            quorum_required: resolution?.quorum_required || 0,
        },
    });

    const onSubmit = async (data: CreateResolutionInput) => {
        setIsSubmitting(true);
        try {
            const url = isEditing ? `/api/resolutions/${resolution.id}` : '/api/resolutions';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save resolution');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving resolution:', error);
            form.setError('root', { message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Resolution' : 'Create New Resolution'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the resolution details below.'
                            : 'Fill in the details to create a new resolution for voting.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter resolution title..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter resolution description..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="voting_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voting Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select voting type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="simple_majority">Simple Majority (&gt;50%)</SelectItem>
                                                <SelectItem value="two_thirds">Two-Thirds (≥67%)</SelectItem>
                                                <SelectItem value="unanimous">Unanimous (100%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quorum_required"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quorum Required</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Minimum votes needed (informational)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.formState.errors.root && (
                            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
