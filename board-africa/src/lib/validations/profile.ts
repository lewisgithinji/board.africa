import { z } from 'zod';

export const availabilityStatusSchema = z.enum(['looking', 'open', 'busy', 'unavailable']);
export const experienceTypeSchema = z.enum(['executive', 'board', 'academic', 'other']);

export const experienceSchema = z.object({
    id: z.string().uuid().optional(),
    company_name: z.string().min(1, 'Company name is required'),
    title: z.string().min(1, 'Job title is required'),
    location: z.string().optional().nullable(),
    start_date: z.string(),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().default(false),
    description: z.string().optional().nullable(),
    experience_type: experienceTypeSchema.default('executive'),
});

export const skillSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Skill name is required'),
    category: z.string().optional().nullable(),
    years_experience: z.number().min(0).optional().nullable(),
});

export const certificationSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Certification name is required'),
    issuing_organization: z.string().min(1, 'Issuing organization is required'),
    issue_date: z.string().optional().nullable(),
    expiry_date: z.string().optional().nullable(),
    credential_id: z.string().optional().nullable(),
    credential_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
});

export const professionalProfileSchema = z.object({
    id: z.string().uuid().optional(),
    headline: z.string().max(200, 'Headline is too long').optional().nullable(),
    summary: z.string().max(2000, 'Summary is too long').optional().nullable(),
    board_readiness_score: z.number().min(0).max(100).optional(),
    is_marketplace_visible: z.boolean().default(false),
    availability_status: availabilityStatusSchema.default('open'),
    desired_roles: z.array(z.string()).optional().nullable(),
    compensation_expectations: z.record(z.any()).optional().nullable(),
    mobility_preference: z.boolean().default(true),
    languages: z.array(z.string()).optional().nullable(),
    social_links: z.record(z.any()).default({}),
});

export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
