import { z } from 'zod';

// Role selection schema
export const roleSelectionSchema = z.object({
    role: z.enum(['organization', 'professional'], {
        required_error: 'Please select a role',
    }),
});

// Organization profile schema
export const organizationProfileSchema = z.object({
    company_name: z.string().min(2, 'Company name must be at least 2 characters'),
    company_website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
        required_error: 'Please select company size',
    }),
    industry: z.string().min(1, 'Please select an industry'),
    country: z.string().min(1, 'Please select a country'),
    phone: z.string().optional(),
});

// Professional profile schema
export const professionalProfileSchema = z.object({
    job_title: z.string().min(2, 'Job title must be at least 2 characters'),
    bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
    linkedin_url: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    years_experience: z.coerce.number().min(0, 'Years of experience must be 0 or greater').max(70, 'Please enter a valid number'),
    industry: z.string().min(1, 'Please select an industry'),
    country: z.string().min(1, 'Please select a country'),
    phone: z.string().optional(),
});

// Avatar upload schema
export const avatarUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type),
            'File must be a JPEG, PNG, or WebP image'
        ),
});

// Combined onboarding schema (for final submission)
export const onboardingSchema = z.discriminatedUnion('role', [
    z.object({
        role: z.literal('organization'),
        ...organizationProfileSchema.shape,
    }),
    z.object({
        role: z.literal('professional'),
        ...professionalProfileSchema.shape,
    }),
]);

// Type exports
export type RoleSelection = z.infer<typeof roleSelectionSchema>;
export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;
export type ProfessionalProfile = z.infer<typeof professionalProfileSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
