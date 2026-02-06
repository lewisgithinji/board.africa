'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { boardMemberSchema, type BoardMemberCreate } from '@/lib/validations/organization';
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
import { Switch } from '@/components/ui/switch';
import { FormSection, FormRow, LoadingButton } from '@/components/ui/forms';
import { User, Briefcase, Calendar, Settings, Save } from 'lucide-react';
import type { BoardMember } from '@/lib/types/database.types';

interface BoardMemberFormProps {
    defaultValues?: Partial<BoardMember>;
    onSubmit: (data: BoardMemberCreate) => void | Promise<void>;
    isSubmitting?: boolean;
    submitLabel?: string;
}

const positions = [
    { value: 'chairman', label: 'Chairman' },
    { value: 'vice_chairman', label: 'Vice Chairman' },
    { value: 'ceo', label: 'CEO' },
    { value: 'cfo', label: 'CFO' },
    { value: 'director', label: 'Director' },
    { value: 'independent_director', label: 'Independent Director' },
    { value: 'executive_director', label: 'Executive Director' },
    { value: 'non_executive_director', label: 'Non-Executive Director' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'member', label: 'Member' },
    { value: 'observer', label: 'Observer' },
    { value: 'other', label: 'Other' },
];

export function BoardMemberForm({
    defaultValues,
    onSubmit,
    isSubmitting,
    submitLabel = 'Save Member',
}: BoardMemberFormProps) {
    const form = useForm<BoardMemberCreate>({
        resolver: zodResolver(boardMemberSchema),
        defaultValues: {
            full_name: defaultValues?.full_name || '',
            email: defaultValues?.email || '',
            phone: defaultValues?.phone || '',
            position: defaultValues?.position || 'member',
            custom_position: defaultValues?.custom_position || '',
            department: defaultValues?.department || '',
            bio: defaultValues?.bio || '',
            linkedin_url: defaultValues?.linkedin_url || '',
            status: defaultValues?.status || 'active',
            start_date: defaultValues?.start_date || new Date().toISOString().split('T')[0],
            end_date: defaultValues?.end_date || '',
            is_independent: defaultValues?.is_independent || false,
            show_on_public_profile: defaultValues?.show_on_public_profile ?? true,
        },
    });

    const selectedPosition = form.watch('position');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-6" suppressHydrationWarning>
                {/* Personal Information */}
                <FormSection
                    title="Personal Information"
                    description="Basic contact details for the board member"
                    icon={User}
                >
                    {/* Full Name (full width) */}
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jane Doe" {...field} value={field.value ?? ''} suppressHydrationWarning />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email + Phone (2 columns) */}
                    <FormRow>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="jane@example.com" {...field} value={field.value ?? ''} suppressHydrationWarning />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+254 700 000 000" {...field} value={field.value ?? ''} suppressHydrationWarning />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormRow>

                    {/* LinkedIn URL (full width) */}
                    <FormField
                        control={form.control}
                        name="linkedin_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''} suppressHydrationWarning />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bio (full width) */}
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Professional background and experience..."
                                        className="min-h-[100px] resize-none"
                                        {...field}
                                        value={field.value ?? ''}
                                        suppressHydrationWarning
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    A brief professional biography for the public profile
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </FormSection>

                {/* Position & Role */}
                <FormSection
                    title="Position & Role"
                    description="Board position and organizational details"
                    icon={Briefcase}
                >
                    {/* Position + Department (2 columns) */}
                    <FormRow>
                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {positions.map((pos) => (
                                                <SelectItem key={pos.value} value={pos.value}>
                                                    {pos.label}
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
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Finance" {...field} value={field.value ?? ''} suppressHydrationWarning />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormRow>

                    {/* Custom Position (shown if position is 'other') */}
                    {selectedPosition === 'other' && (
                        <FormField
                            control={form.control}
                            name="custom_position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Position *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Special Advisor" {...field} value={field.value ?? ''} suppressHydrationWarning />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Independent Director (full width switch) */}
                    <FormField
                        control={form.control}
                        name="is_independent"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Independent Director</FormLabel>
                                    <FormDescription className="text-xs">
                                        Mark as independent/non-executive director
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </FormSection>

                {/* Membership Dates */}
                <FormSection
                    title="Membership Dates"
                    description="Board membership tenure information"
                    icon={Calendar}
                >
                    {/* Start Date + End Date (2 columns) */}
                    <FormRow>
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Leave empty if currently serving
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormRow>

                    {/* Status (full width select) */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </FormSection>

                {/* Privacy Settings */}
                <FormSection
                    title="Privacy Settings"
                    description="Control public visibility of this member"
                    icon={Settings}
                >
                    <FormField
                        control={form.control}
                        name="show_on_public_profile"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Show on Public Profile</FormLabel>
                                    <FormDescription className="text-xs">
                                        Display this member on your public organization profile
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </FormSection>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <LoadingButton
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                        icon={<Save className="h-4 w-4" />}
                        size="lg"
                        disabled={!form.formState.isValid && form.formState.isSubmitted}
                    >
                        {submitLabel}
                    </LoadingButton>
                </div>
            </form>
        </Form>
    );
}
