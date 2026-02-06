'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillSchema, SkillInput } from '@/lib/validations/profile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skill } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface SkillDialogProps {
    profileId: string;
    skill?: Skill;
    onSuccess: () => void;
}

const categories = [
    'Finance',
    'Operations',
    'Legal',
    'Technology',
    'Marketing',
    'Human Resources',
    'Sustainability',
    'Cybersecurity',
    'Strategy',
    'Governance',
    'Other',
];

export function SkillDialog({ profileId, skill, onSuccess }: SkillDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const form = useForm<SkillInput>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: skill?.name || '',
            category: skill?.category || 'Other',
            years_experience: skill?.years_experience || 0,
        },
    });

    async function onSubmit(values: SkillInput) {
        setIsSubmitting(true);
        try {
            if (skill) {
                const { error } = await supabase
                    .from('skills')
                    .update(values)
                    .eq('id', skill.id);
                if (error) throw error;
                toast.success('Skill updated');
            } else {
                const { error } = await supabase
                    .from('skills')
                    .insert({
                        ...values,
                        profile_id: profileId,
                    });
                if (error) throw error;
                toast.success('Skill added');
            }
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error saving skill');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Skill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{skill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
                    <DialogDescription>
                        Add a functional or governance skill to your profile.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skill Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Financial Oversight" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'Other'}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="years_experience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            value={field.value || 0}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {skill ? 'Update' : 'Add'} Skill
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
