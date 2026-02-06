import { z } from 'zod';

// Base64 PNG validation regex
const base64PngRegex = /^data:image\/png;base64,/;

export const createSignatureSchema = z.object({
    board_member_id: z.string().uuid('Invalid board member ID'),
    signature_data: z.string().min(1, 'Signature data is required').refine(
        (data) => base64PngRegex.test(data),
        {
            message: 'Signature data must be a valid base64 PNG image',
        }
    ),
    signature_type: z.enum(['drawn', 'typed'], {
        required_error: 'Signature type is required',
        invalid_type_error: 'Signature type must be either drawn or typed',
    }),
    typed_name: z.string().optional(),
}).refine(
    (data) => {
        // If signature_type is 'typed', typed_name must be provided
        if (data.signature_type === 'typed') {
            return data.typed_name && data.typed_name.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Typed name is required for typed signatures',
        path: ['typed_name'],
    }
);

export type CreateSignatureInput = z.infer<typeof createSignatureSchema>;
