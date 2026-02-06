/**
 * Validation schemas for documents feature
 */

import { z } from 'zod';

// Document schema
export const documentSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
    description: z.string().optional().nullable(),
    category: z.enum(['financial', 'legal', 'strategic', 'operational', 'governance', 'other']).optional().nullable(),
    meeting_id: z.string().uuid('Invalid meeting ID').optional().nullable(),
    board_member_id: z.string().uuid('Invalid board member ID').optional().nullable(),
    file_url: z.string().min(1, 'File URL/path is required'),
    file_name: z.string().min(1, 'File name is required'),
    file_size: z.number().min(0, 'File size must be positive').optional().nullable(),
    file_type: z.string().optional().nullable(),
    is_public: z.boolean().default(false),
    version: z.number().min(1).default(1),
    parent_document_id: z.string().uuid('Invalid parent document ID').optional().nullable(),
    is_library_item: z.boolean().default(false),
    library_category: z.string().optional().nullable(),
});

export const createDocumentSchema = documentSchema.omit({ file_url: true });
export const updateDocumentSchema = documentSchema.partial();

// File upload validation
export const fileUploadSchema = z.object({
    file_name: z.string().min(1, 'File name is required'),
    file_size: z.number()
        .min(1, 'File must not be empty')
        .max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
    file_type: z.string()
        .refine((type) => {
            const allowedTypes = [
                // Documents
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'text/csv',
                // Images
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ];
            return allowedTypes.includes(type);
        }, 'File type not allowed'),
});

// Request to generate upload URL
export const generateUploadUrlSchema = z.object({
    file_name: z.string().min(1, 'File name is required'),
    file_size: z.number()
        .min(1, 'File size must be greater than 0')
        .max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
    file_type: z.string(),
    document_title: z.string().min(3, 'Document title is required'),
    category: z.enum(['financial', 'legal', 'strategic', 'operational', 'governance', 'other']).optional().nullable(),
    meeting_id: z.string().uuid().optional().nullable(),
});

// Document search/filter schema
export const documentFilterSchema = z.object({
    category: z.enum(['financial', 'legal', 'strategic', 'operational', 'governance', 'other']).optional(),
    meeting_id: z.string().uuid().optional(),
    board_member_id: z.string().uuid().optional(),
    is_public: z.boolean().optional(),
    is_library_item: z.boolean().optional(),
    library_category: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().min(0).default(0).optional(),
});

// Type exports
export type DocumentFormData = z.infer<typeof documentSchema>;
export type CreateDocumentRequest = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type GenerateUploadUrlRequest = z.infer<typeof generateUploadUrlSchema>;
export type DocumentFilter = z.infer<typeof documentFilterSchema>;
