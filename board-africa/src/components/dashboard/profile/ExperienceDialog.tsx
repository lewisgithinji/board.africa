'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experienceSchema, ExperienceInput } from '@/lib/validations/profile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Experience } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface ExperienceDialogProps {
    profileId: string;
    experience?: Experience;
    onSuccess: () => void;
}

export function ExperienceDialog({ profileId, experience, onSuccess }: ExperienceDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const form = useForm<ExperienceInput>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            company_name: experience?.company_name || '',
            title: experience?.title || '',
            location: experience?.location || '',
            start_date: experience?.start_date || '',
            end_date: experience?.end_date || '',
            is_current: experience?.is_current || false,
            description: experience?.description || '',
            experience_type: experience?.experience_type || 'executive',
        },
    });

    const isCurrent = form.watch('is_current');

    async function onSubmit(values: ExperienceInput) {
        setIsSubmitting(true);
        try {
            if (experience) {
                const { error } = await supabase
                    .from('experiences')
                    .update({
                        ...values,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', experience.id);
                if (error) throw error;
                toast.success('Experience updated');
            } else {
                const { error } = await supabase
                    .from('experiences')
                    .insert({
                        ...values,
                        profile_id: profileId,
                    });
                if (error) throw error;
                toast.success('Experience added');
            }
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error saving experience');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {experience ? (
                    <Button variant="ghost" size="sm">Edit</Button>
                ) : (
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Experience
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{experience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
                    <DialogDescription>
                        Enter details about your executive or board role.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="experience_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="executive">Executive Role</SelectItem>
                                            <SelectItem value="board">Board Member (NED/Chair)</SelectItem>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="company_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company / Organization</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position / Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Chief Operating Officer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!isCurrent && (
                                <FormField
                                    control={form.control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="is_current"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>I am currently in this role</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description / Key Contributions</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Briefly describe your responsibilities..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {experience ? 'Update' : 'Add'} Experience
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
