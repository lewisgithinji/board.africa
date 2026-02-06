'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { organizationUpdateSchema, type OrganizationUpdateInput } from '@/lib/validations/organization';
import type { Organization } from '@/lib/types/database.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FormSection, FormRow, LoadingButton } from '@/components/ui/forms';
import { Building2, Globe, Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);

    const form = useForm<OrganizationUpdateInput>({
        resolver: zodResolver(organizationUpdateSchema),
        defaultValues: {
            company_name: '',
            display_name: '',
            tagline: '',
            description: '',
            website: '',
            contact_email: '',
            contact_phone: '',
            headquarters_address: '',
            year_founded: undefined,
            is_public: false,
            allow_member_directory: false,
        },
    });

    // Fetch organization data
    useEffect(() => {
        async function fetchOrganization() {
            try {
                const res = await fetch('/api/organizations');
                const data = await res.json();

                if (data.organization) {
                    setOrganization(data.organization);
                    form.reset({
                        company_name: data.organization.company_name || '',
                        display_name: data.organization.display_name || '',
                        tagline: data.organization.tagline || '',
                        description: data.organization.description || '',
                        website: data.organization.website || '',
                        contact_email: data.organization.contact_email || '',
                        contact_phone: data.organization.contact_phone || '',
                        headquarters_address: data.organization.headquarters_address || '',
                        year_founded: data.organization.year_founded || undefined,
                        is_public: data.organization.is_public ?? false,
                        allow_member_directory: data.organization.allow_member_directory ?? false,
                    });
                }
            } catch (error) {
                console.error('Error fetching organization:', error);
                toast.error('Failed to load organization settings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrganization();
    }, [form]);

    async function onSubmit(data: OrganizationUpdateInput) {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const res = await fetch('/api/organizations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update organization');
            }

            const result = await res.json();
            setOrganization(result.organization);

            // Show success state
            setSaveSuccess(true);
            toast.success('Organization settings saved successfully');

            // Reset success state after 2 seconds
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error('Error updating organization:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save organization settings');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl space-y-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Skeleton className="h-96 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your organization profile and public presence
                    </p>
                </div>
                {organization?.is_public && organization?.slug && (
                    <Link href={`/org/${organization.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Public Profile
                        </Button>
                    </Link>
                )}
            </div>

            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <FormSection
                        title="Basic Information"
                        description="This information will be displayed on your organization profile"
                        icon={Building2}
                    >
                        {/* Company Name + Display Name (2 columns) */}
                        <FormRow>
                            <FormField
                                control={form.control}
                                name="company_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Corporation" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="display_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Corp" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Optional shorter name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormRow>

                        {/* Tagline (full width) */}
                        <FormField
                            control={form.control}
                            name="tagline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tagline</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Building the future" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        A brief tagline or slogan
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description (full width) */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about your organization..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        A detailed description of your organization
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Contact Information */}
                    <FormSection
                        title="Contact Information"
                        description="How people can reach your organization"
                        icon={Globe}
                    >
                        {/* Website + Year Founded (2 columns) */}
                        <FormRow>
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="year_founded"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Founded</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2020"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? parseInt(value) : undefined);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormRow>

                        {/* Contact Email + Contact Phone (2 columns) */}
                        <FormRow>
                            <FormField
                                control={form.control}
                                name="contact_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+254 700 000 000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormRow>

                        {/* Headquarters Address (full width) */}
                        <FormField
                            control={form.control}
                            name="headquarters_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Headquarters Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="123 Main St, City, Country"
                                            className="min-h-[80px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Public Profile Settings */}
                    <FormSection
                        title="Public Profile Settings"
                        description="Control what information is publicly visible"
                    >
                        <FormField
                            control={form.control}
                            name="is_public"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Public Profile</FormLabel>
                                        <FormDescription className="text-xs">
                                            Make your organization profile publicly visible at /org/{organization?.slug || 'your-org'}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="allow_member_directory"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Member Directory</FormLabel>
                                        <FormDescription className="text-xs">
                                            Allow public viewing of board member directory
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                        <LoadingButton
                            type="submit"
                            isLoading={isSaving}
                            loadingText="Saving..."
                            icon={saveSuccess ? <Save className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            size="lg"
                            disabled={!form.formState.isValid && form.formState.isSubmitted}
                        >
                            {saveSuccess ? 'Saved ✓' : 'Save Changes'}
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    );
}
