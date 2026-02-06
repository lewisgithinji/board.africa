'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { professionalProfileSchema, type ProfessionalProfile } from '@/lib/validations/onboarding';
import { INDUSTRIES, AFRICAN_COUNTRIES } from '@/lib/utils/onboarding';
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

interface ProfessionalFormProps {
    defaultValues?: Partial<ProfessionalProfile>;
    onSubmit: (data: ProfessionalProfile) => void;
    children?: React.ReactNode;
}

export function ProfessionalForm({ defaultValues, onSubmit, children }: ProfessionalFormProps) {
    const form = useForm<ProfessionalProfile>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            job_title: defaultValues?.job_title || '',
            bio: defaultValues?.bio || '',
            linkedin_url: defaultValues?.linkedin_url || '',
            years_experience: defaultValues?.years_experience || 0,
            industry: defaultValues?.industry || '',
            country: defaultValues?.country || '',
            phone: defaultValues?.phone || '',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="text-center space-y-2 mb-6">
                        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                        <p className="text-muted-foreground">
                            Build your professional profile to connect with opportunities
                        </p>
                    </div>

                    {/* Job Title */}
                    <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Job Title *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Board Director, CEO, CFO, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bio */}
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Professional Bio *</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us about your experience, expertise, and what you bring to a board..."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Minimum 50 characters - Highlight your board experience and expertise
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Years of Experience */}
                    <FormField
                        control={form.control}
                        name="years_experience"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Years of Board Experience *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="70"
                                        placeholder="5"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Total years serving on boards or in leadership roles
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* LinkedIn URL */}
                    <FormField
                        control={form.control}
                        name="linkedin_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn Profile</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://www.linkedin.com/in/yourprofile" {...field} />
                                </FormControl>
                                <FormDescription>Optional - Your LinkedIn profile URL</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Industry */}
                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Industry *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {INDUSTRIES.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Country */}
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {AFRICAN_COUNTRIES.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+254 700 000 000" {...field} />
                                </FormControl>
                                <FormDescription>Optional - Your contact number</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {children}
            </form>
        </Form>
    );
}
