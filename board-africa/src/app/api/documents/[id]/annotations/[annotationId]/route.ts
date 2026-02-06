import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateAnnotationSchema } from '@/lib/validations/annotation';

/**
 * PATCH /api/documents/[id]/annotations/[annotationId]
 * Update a specific annotation
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; annotationId: string } }
) {
    try {
        const supabase = await createClient();
        const { annotationId } = params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = updateAnnotationSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Update annotation
        const { data: annotation, error } = await supabase
            .from('document_annotations')
            .update(validationResult.data)
            .eq('id', annotationId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating annotation:', error);
            return NextResponse.json({ error: 'Failed to update annotation' }, { status: 500 });
        }

        return NextResponse.json({ annotation });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/documents/[id]/annotations/[annotationId]
 * Delete a specific annotation
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string; annotationId: string } }
) {
    try {
        const supabase = await createClient();
        const { annotationId } = params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete annotation
        const { error } = await supabase
            .from('document_annotations')
            .delete()
            .eq('id', annotationId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting annotation:', error);
            return NextResponse.json({ error: 'Failed to delete annotation' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
