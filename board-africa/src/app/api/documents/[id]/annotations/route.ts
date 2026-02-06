import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAnnotationSchema } from '@/lib/validations/annotation';

/**
 * GET /api/documents/[id]/annotations
 * List all annotations for a document
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id: documentId } = params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get annotations
        const { data: annotations, error } = await supabase
            .from('document_annotations')
            .select('*')
            .eq('document_id', documentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching annotations:', error);
            return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 });
        }

        return NextResponse.json({ annotations: annotations || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/documents/[id]/annotations
 * Create a new annotation
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id: documentId } = params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = createAnnotationSchema.safeParse({ ...body, document_id: documentId });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Verify document belongs to organization
        const { data: document, error: docError } = await supabase
            .from('documents')
            .select('id')
            .eq('id', documentId)
            .eq('organization_id', user.id)
            .single();

        if (docError || !document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Create annotation
        const { data: annotation, error } = await supabase
            .from('document_annotations')
            .insert({
                ...validationResult.data,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating annotation:', error);
            return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 });
        }

        return NextResponse.json({ annotation }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
