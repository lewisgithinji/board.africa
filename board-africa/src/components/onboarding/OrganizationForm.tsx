'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationProfileSchema, type OrganizationProfile } from '@/lib/validations/onboarding';
import { INDUSTRIES, AFRICAN_COUNTRIES, COMPANY_SIZES } from '@/lib/utils/onboarding';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OrganizationFormProps {
    defaultValues?: Partial<OrganizationProfile>;
    onSubmit: (data: OrganizationProfile) => void;
    children?: React.ReactNode;
}

export function OrganizationForm({ defaultValues, onSubmit, children }: OrganizationFormProps) {
    const form = useForm<OrganizationProfile>({
        resolver: zodResolver(organizationProfileSchema),
        defaultValues: {
            company_name: defaultValues?.company_name || '',
            company_website: defaultValues?.company_website || '',
            company_size: defaultValues?.company_size,
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
                        <h2 className="text-2xl font-bold">Tell us about your organization</h2>
                        <p className="text-muted-foreground">
                            This information will help us personalize your experience
                        </p>
                    </div>

                    {/* Company Name */}
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

                    {/* Company Website */}
                    <FormField
                        control={form.control}
                        name="company_website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Website</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://www.example.com" {...field} />
                                </FormControl>
                                <FormDescription>Optional - Your company's website URL</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Company Size */}
                    <FormField
                        control={form.control}
                        name="company_size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Size *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select company size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {COMPANY_SIZES.map((size) => (
                                            <SelectItem key={size.value} value={size.value}>
                                                {size.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <FormLabel>Industry *</FormLabel>
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
                                <FormDescription>Optional - Your company's contact number</FormDescription>
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
