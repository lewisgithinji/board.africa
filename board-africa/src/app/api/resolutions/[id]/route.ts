import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateResolutionSchema } from '@/lib/validations/resolution';

/**
 * GET /api/resolutions/[id]
 * Get single resolution with votes
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get resolution with votes
        const { data: resolution, error } = await supabase
            .from('resolutions')
            .select(`
                *,
                votes (
                    id,
                    vote,
                    comment,
                    voted_at,
                    board_member:board_members (
                        id,
                        full_name,
                        avatar_url,
                        position
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error || !resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        // Calculate vote summary
        const votes = resolution.votes || [];
        const vote_summary = {
            approve: votes.filter((v: any) => v.vote === 'approve').length,
            reject: votes.filter((v: any) => v.vote === 'reject').length,
            abstain: votes.filter((v: any) => v.vote === 'abstain').length,
            total: votes.length,
        };

        return NextResponse.json({ resolution: { ...resolution, vote_summary } });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/resolutions/[id]
 * Update resolution
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = updateResolutionSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Update resolution
        const { data: resolution, error } = await supabase
            .from('resolutions')
            .update(validationResult.data)
            .eq('id', id)
            .select()
            .single();

        if (error || !resolution) {
            console.error('Error updating resolution:', error);
            return NextResponse.json({ error: 'Failed to update resolution' }, { status: 500 });
        }

        return NextResponse.json({ resolution });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/resolutions/[id]
 * Delete resolution (only draft status)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check resolution status first
        const { data: resolution } = await supabase
            .from('resolutions')
            .select('status')
            .eq('id', id)
            .single();

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'draft') {
            return NextResponse.json(
                { error: 'Only draft resolutions can be deleted' },
                { status: 400 }
            );
        }

        // Delete resolution
        const { error } = await supabase.from('resolutions').delete().eq('id', id);

        if (error) {
            console.error('Error deleting resolution:', error);
            return NextResponse.json({ error: 'Failed to delete resolution' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
