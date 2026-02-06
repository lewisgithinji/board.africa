'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { certificationSchema, CertificationInput } from '@/lib/validations/profile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Certification } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface CertificationDialogProps {
    profileId: string;
    certification?: Certification;
    onSuccess: () => void;
}

export function CertificationDialog({ profileId, certification, onSuccess }: CertificationDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const form = useForm<CertificationInput>({
        resolver: zodResolver(certificationSchema),
        defaultValues: {
            name: certification?.name || '',
            issuing_organization: certification?.issuing_organization || '',
            issue_date: certification?.issue_date || '',
            expiry_date: certification?.expiry_date || '',
            credential_id: certification?.credential_id || '',
            credential_url: certification?.credential_url || '',
        },
    });

    async function onSubmit(values: CertificationInput) {
        setIsSubmitting(true);
        try {
            if (certification) {
                const { error } = await supabase
                    .from('certifications')
                    .update(values)
                    .eq('id', certification.id);
                if (error) throw error;
                toast.success('Certification updated');
            } else {
                const { error } = await supabase
                    .from('certifications')
                    .insert({
                        ...values,
                        profile_id: profileId,
                    });
                if (error) throw error;
                toast.success('Certification added');
            }
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error saving certification');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Certification
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{certification ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
                    <DialogDescription>
                        Add professional or board-specific certifications.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Certification Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Certified Board Director" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="issuing_organization"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Issuing Organization</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Kenya Institute of Management" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="issue_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Issue Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiry_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="credential_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credential URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {certification ? 'Update' : 'Add'} Certification
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
