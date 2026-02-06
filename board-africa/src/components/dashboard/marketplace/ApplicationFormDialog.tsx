'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, ApplicationInput } from '@/lib/validations/marketplace';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ApplicationFormDialogProps {
    positionId: string;
    positionTitle: string;
}

export function ApplicationFormDialog({ positionId, positionTitle }: ApplicationFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<ApplicationInput>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            position_id: positionId,
            profile_id: '', // Will be set on submit
            cover_letter: '',
            status: 'submitted',
        },
    });

    async function onSubmit(values: ApplicationInput) {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to apply');

            const { error } = await supabase
                .from('applications')
                .insert({
                    position_id: positionId,
                    profile_id: user.id,
                    cover_letter: values.cover_letter,
                    status: 'submitted',
                });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('You have already applied for this position.');
                }
                throw error;
            };

            toast.success('Your application has been submitted successfully!');
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error submitting application');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="px-8 font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Apply for this Position
                    <Send className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-2xl">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl">Apply for {positionTitle}</DialogTitle>
                    <DialogDescription>
                        Submit your cover letter and your professional profile will be shared with the organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                        <FormField
                            control={form.control}
                            name="cover_letter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-bold">Cover Letter / Statement of Interest</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Explain why you are the ideal candidate for this board position..."
                                            className="min-h-[300px] bg-muted/20 border-primary/10 transition-all focus:bg-background focus:ring-primary/20"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Organizations will also review your full Professional Profile, experiences, and certifications.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-semibold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="font-bold min-w-[140px]">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
