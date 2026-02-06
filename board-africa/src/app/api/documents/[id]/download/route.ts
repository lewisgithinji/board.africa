import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents/[id]/download
 * Generate a signed URL for downloading a private document
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

        // 1. Get document metadata
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', params.id)
            .eq('organization_id', user.id)
            .single();

        if (fetchError || !document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // 2. Generate signed URL (valid for 60 seconds)
        const { data, error: signedUrlError } = await supabase.storage
            .from('board-africa-documents')
            .createSignedUrl(document.file_url, 60);

        if (signedUrlError) {
            console.error('Error generating signed URL:', signedUrlError);
            return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
        }

        return NextResponse.json({ download_url: data.signedUrl });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
