'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAgendaItemSchema } from '@/lib/validations/agenda';
import type { AgendaItemInsert, BoardMember, Document, Resolution } from '@/lib/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Save } from 'lucide-react';
import useSWR from 'swr';

interface AgendaItemFormProps {
    meetingId: string;
    initialData?: Partial<AgendaItemInsert>;
    onSubmit: (data: AgendaItemInsert) => Promise<void>;
    onCancel: () => void;
    boardMembers: BoardMember[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AgendaItemForm({
    meetingId,
    initialData,
    onSubmit,
    onCancel,
    boardMembers
}: AgendaItemFormProps) {
    const { data: docsData } = useSWR<{ documents: Document[] }>('/api/documents', fetcher);
    const { data: resData } = useSWR<{ resolutions: Resolution[] }>(`/api/resolutions?meeting_id=${meetingId}`, fetcher);

    const form = useForm<AgendaItemInsert>({
        resolver: zodResolver(createAgendaItemSchema),
        defaultValues: {
            meeting_id: meetingId,
            title: initialData?.title || '',
            description: initialData?.description || '',
            duration_minutes: initialData?.duration_minutes || 10,
            item_type: initialData?.item_type || 'regular',
            presenter_id: initialData?.presenter_id || null,
            document_id: initialData?.document_id || null,
            resolution_id: initialData?.resolution_id || null,
            order_index: initialData?.order_index || 0,
            status: initialData?.status || 'pending',
            parent_id: initialData?.parent_id || null,
        },
    });

    const handleFormSubmit = async (data: AgendaItemInsert) => {
        // Convert "none" string values from Select back to null
        const cleanedData = {
            ...data,
            presenter_id: data.presenter_id === 'none' ? null : data.presenter_id,
            document_id: data.document_id === 'none' ? null : data.document_id,
            resolution_id: data.resolution_id === 'none' ? null : data.resolution_id,
        };
        await onSubmit(cleanedData);
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Item Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. CEO's Quarterly Performance Review" {...field} className="bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="item_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Item Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        <SelectItem value="regular">Regular Item</SelectItem>
                                        <SelectItem value="consent">Consent Agenda</SelectItem>
                                        <SelectItem value="presentation">Presentation</SelectItem>
                                        <SelectItem value="vote">Vote / Resolution</SelectItem>
                                        <SelectItem value="break">Break</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duration_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (min)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        className="bg-white border-slate-200 rounded-xl"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="presenter_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Presenter (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[250px]">
                                        <SelectItem value="none">None</SelectItem>
                                        {boardMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="document_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Reference Document</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white border-slate-200 rounded-xl text-left">
                                            <SelectValue placeholder="Link a document" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[250px]">
                                        <SelectItem value="none">None</SelectItem>
                                        {docsData?.documents.map((doc) => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                {doc.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="resolution_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Link Resolution</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white border-slate-200 rounded-xl text-left">
                                            <SelectValue placeholder="Link a resolution" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[250px]">
                                        <SelectItem value="none">None</SelectItem>
                                        {resData?.resolutions.map((res) => (
                                            <SelectItem key={res.id} value={res.id}>
                                                {res.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Description / Minutes Prefix</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add any additional details or preparation notes..."
                                        className="bg-white border-slate-200 min-h-[100px] resize-none focus:ring-blue-500/10 focus:border-blue-500 rounded-xl p-4"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl h-11 px-6 text-slate-500 font-semibold">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-blue-600/20 gap-2 font-bold transition-all active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {initialData?.id ? 'Update Item' : 'Add Item'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
