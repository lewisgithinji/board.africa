import { z } from 'zod';

// Organization validation schemas
export const organizationCreateSchema = z.object({
    company_name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
    display_name: z.string().max(100).optional().nullable(),
    tagline: z.string().max(200).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    logo_url: z.string().url().optional().nullable(),
    cover_image_url: z.string().url().optional().nullable(),
    brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    website: z.string().url().optional().nullable().or(z.literal('')),
    company_size: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    contact_email: z.string().email().optional().nullable().or(z.literal('')),
    contact_phone: z.string().optional().nullable(),
    headquarters_address: z.string().max(500).optional().nullable(),
    registration_number: z.string().max(50).optional().nullable(),
    tax_id: z.string().max(50).optional().nullable(),
    year_founded: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
    is_public: z.boolean().optional(),
    allow_member_directory: z.boolean().optional(),
});

export const organizationUpdateSchema = organizationCreateSchema.partial();

export type OrganizationCreate = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;

// Board member validation schemas
export const memberPositionEnum = z.enum([
    'chairman',
    'vice_chairman',
    'ceo',
    'cfo',
    'director',
    'independent_director',
    'executive_director',
    'non_executive_director',
    'secretary',
    'member',
    'observer',
    'other',
]);

export const memberStatusEnum = z.enum(['active', 'inactive', 'pending']);

// Base schema without refinements (allows .partial() to work)
const boardMemberBaseSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email().optional().nullable().or(z.literal('')),
    phone: z.string().max(20).optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
    position: memberPositionEnum,
    custom_position: z.string().max(100).optional().nullable(),
    department: z.string().max(100).optional().nullable(),
    bio: z.string().max(2000).optional().nullable(),
    linkedin_url: z.string().url().optional().nullable().or(z.literal('')),
    qualifications: z.array(z.string()).optional().nullable(),
    status: memberStatusEnum.default('active'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable().or(z.literal('')),
    term_length: z.number().int().positive().optional().nullable(),
    is_independent: z.boolean().default(false),
    committees: z.array(z.string()).optional().nullable(),
    display_order: z.number().int().min(0).optional(),
    show_on_public_profile: z.boolean().default(true),
});

// Create schema with refinements (for POST - creating new members)
export const boardMemberSchema = boardMemberBaseSchema.refine(
    (data) => {
        if (data.position === 'other') {
            return !!data.custom_position && data.custom_position.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Custom position is required when position is "other"',
        path: ['custom_position'],
    }
).refine(
    (data) => {
        if (data.end_date && data.start_date) {
            return new Date(data.end_date) >= new Date(data.start_date);
        }
        return true;
    },
    {
        message: 'End date must be after start date',
        path: ['end_date'],
    }
);

// Update schema uses base schema .partial() - no refinements for flexibility
export const boardMemberUpdateSchema = boardMemberBaseSchema.partial();

export type BoardMemberCreate = z.infer<typeof boardMemberSchema>;
export type BoardMemberUpdateInput = z.infer<typeof boardMemberUpdateSchema>;

// Reorder validation
export const reorderMembersSchema = z.object({
    member_ids: z.array(z.string().uuid()).min(1, 'At least one member ID is required'),
});

export type ReorderMembers = z.infer<typeof reorderMembersSchema>;
