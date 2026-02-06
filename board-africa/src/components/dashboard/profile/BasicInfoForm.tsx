'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { professionalProfileSchema, ProfessionalProfileInput } from '@/lib/validations/profile';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProfessionalProfile } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles, Bot } from 'lucide-react';
import { optimizeProfile } from '@/lib/actions/ai-profile';

interface BasicInfoFormProps {
    profile: Partial<ProfessionalProfile>;
}

export function BasicInfoForm({ profile }: BasicInfoFormProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const supabase = createClient();

    const form = useForm<ProfessionalProfileInput>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            headline: profile.headline || '',
            summary: profile.summary || '',
            availability_status: profile.availability_status || 'open',
            is_marketplace_visible: profile.is_marketplace_visible || false,
            mobility_preference: profile.mobility_preference || true,
        },
    });

    async function onSubmit(values: ProfessionalProfileInput) {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('professional_profiles')
                .update({
                    ...values,
                    updated_at: new Date().toISOString(),
                })
                .eq('profile_id', profile.profile_id);

            if (error) throw error;
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleOptimize() {
        setIsOptimizing(true);
        toast.info('AI is analyzing your profile data...');

        try {
            const result = await optimizeProfile();
            if (result) {
                form.setValue('headline', result.headline);
                form.setValue('summary', result.summary);
                toast.success('Profile optimized with AI!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Optimization failed');
        } finally {
            setIsOptimizing(false);
        }
    }

    return (
        <Form {...form}>
            <div className="flex justify-between items-center mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="space-y-1">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        AI Profile Optimizer
                    </h4>
                    <p className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 font-medium">
                        Use AI to craft a high-impact board headline and summary based on your experience.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 gap-2 shadow-sm font-semibold"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                >
                    {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                    {isOptimizing ? 'Optimizing...' : 'Enhance with AI'}
                </Button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Strategic Independent Director | Finance Expert" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                                A short, catchy headline for your board profile.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Professional Summary / Board Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your executive journey and typical board contributions..."
                                    className="min-h-[200px]"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormDescription>
                                Highlight your key achievements and areas where you add most value to a board.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
