import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateDocumentSchema } from '@/lib/validations/document';

/**
 * GET /api/documents/[id]
 * Get details for a specific document
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: document, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', params.id)
            .eq('organization_id', user.id)
            .single();

        if (error || !document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/documents/[id]
 * Update document metadata
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = updateDocumentSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Update document
        const { data: document, error } = await supabase
            .from('documents')
            .update(validationResult.data)
            .eq('id', params.id)
            .eq('organization_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating document:', error);
            return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document from database and storage
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get document to find the file path
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('file_url')
            .eq('id', params.id)
            .eq('organization_id', user.id)
            .single();

        if (fetchError || !document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // 2. Extract path from URL (Assuming path is stored in file_url or derived from it)
        // For Supabase, if we store the path in file_url, we use it directly.
        // If it's a full URL, we need to extract the path.
        const filePath = document.file_url; // Assuming we store the storage path

        // 3. Delete from storage
        const { error: storageError } = await supabase.storage
            .from('board-africa-documents')
            .remove([filePath]);

        if (storageError) {
            console.error('Error deleting from storage:', storageError);
            // We continue even if storage deletion fails to avoid orphaned metadata
        }

        // 4. Delete from database
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', params.id)
            .eq('organization_id', user.id);

        if (deleteError) {
            console.error('Error deleting document record:', deleteError);
            return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
