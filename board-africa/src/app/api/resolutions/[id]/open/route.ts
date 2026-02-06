import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/resolutions/[id]/open
 * Open resolution for voting
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id: resolutionId } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get resolution
        const { data: resolution } = await supabase
            .from('resolutions')
            .select('status')
            .eq('id', resolutionId)
            .single();

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'draft') {
            return NextResponse.json(
                { error: 'Only draft resolutions can be opened for voting' },
                { status: 400 }
            );
        }

        // Open voting
        const { data: updatedResolution, error } = await supabase
            .from('resolutions')
            .update({
                status: 'open',
                opened_at: new Date().toISOString(),
            })
            .eq('id', resolutionId)
            .select()
            .single();

        if (error) {
            console.error('Error opening resolution:', error);
            return NextResponse.json({ error: 'Failed to open resolution' }, { status: 500 });
        }

        return NextResponse.json({ resolution: updatedResolution });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
