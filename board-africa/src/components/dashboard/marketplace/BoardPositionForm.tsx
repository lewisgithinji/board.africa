'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { boardPositionSchema, BoardPositionInput } from '@/lib/validations/marketplace';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BoardPositionFormProps {
    organizationId: string;
    initialData?: any;
}

export function BoardPositionForm({ organizationId, initialData }: BoardPositionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<BoardPositionInput>({
        resolver: zodResolver(boardPositionSchema),
        defaultValues: initialData || {
            organization_id: organizationId,
            title: '',
            description: '',
            requirements: [],
            is_remunerated: false,
            compensation_details: '',
            location: '',
            position_type: 'Non-Executive Director',
            status: 'open',
            closing_date: '',
        },
    });

    async function onSubmit(values: BoardPositionInput) {
        setIsSubmitting(true);
        try {
            if (initialData?.id) {
                const { error } = await supabase
                    .from('board_positions')
                    .update(values)
                    .eq('id', initialData.id);
                if (error) throw error;
                toast.success('Position updated successfully');
            } else {
                const { error } = await supabase
                    .from('board_positions')
                    .insert({
                        ...values,
                        created_by: organizationId, // Setting created_by to the user ID
                    });
                if (error) throw error;
                toast.success('Position posted successfully');
            }
            router.push('/marketplace/vacancies');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error saving position');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-full">
                                <FormLabel className="text-base font-bold">Position Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Independent Non-Executive Director" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="position_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-bold">Position Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Non-Executive Director">Non-Executive Director</SelectItem>
                                        <SelectItem value="Chairperson">Chairperson</SelectItem>
                                        <SelectItem value="Advisory Board Member">Advisory Board Member</SelectItem>
                                        <SelectItem value="Trustee">Trustee</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-bold">Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Nairobi, Kenya or Remote" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold">Role Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detail the responsibilities and the organization's current board context..."
                                    className="min-h-[200px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-6 pt-4 border-t">
                    <h3 className="text-lg font-bold">Compensation & Deadline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-muted/20">
                        <FormField
                            control={form.control}
                            name="is_remunerated"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Remunerated Position</FormLabel>
                                        <FormDescription className="text-xs">Is there a sitting allowance or retainer?</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="closing_date"
                            render={({ field }) => (
                                <FormItem className="rounded-lg border p-4 bg-background">
                                    <FormLabel className="text-base">Closing Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value || ''} className="mt-2" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch('is_remunerated') && (
                            <FormField
                                control={form.control}
                                name="compensation_details"
                                render={({ field }) => (
                                    <FormItem className="col-span-full">
                                        <FormLabel className="text-base">Compensation Details (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Competitive sitting allowance" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="ghost" onClick={() => router.back()} className="font-semibold">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="font-bold min-w-[160px] gap-2">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!isSubmitting && <Save className="h-4 w-4" />}
                        {initialData?.id ? 'Update Position' : 'Post Vacancy'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
