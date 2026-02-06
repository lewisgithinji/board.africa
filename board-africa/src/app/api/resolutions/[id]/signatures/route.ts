import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSignatureSchema } from '@/lib/validations/signature';

/**
 * GET /api/resolutions/[id]/signatures
 * List all signatures for a resolution
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Get signatures with board member details
        const { data: signatures, error } = await supabase
            .from('signatures')
            .select(`
                *,
                board_member:board_members (
                    id,
                    full_name,
                    avatar_url,
                    position
                )
            `)
            .eq('resolution_id', resolutionId)
            .order('signed_at', { ascending: true });

        if (error) {
            console.error('Error fetching signatures:', error);
            return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
        }

        return NextResponse.json({ signatures: signatures || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/resolutions/[id]/signatures
 * Create new signature
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

        const body = await request.json();
        const validationResult = createSignatureSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { board_member_id, signature_data, signature_type, typed_name } = validationResult.data;

        // Verify resolution exists and is in 'passed' status
        const { data: resolution, error: resError } = await supabase
            .from('resolutions')
            .select('id, status, organization_id')
            .eq('id', resolutionId)
            .single();

        if (resError || !resolution) {
            return NextResponse.json({ error: 'Resolution not found' }, { status: 404 });
        }

        if (resolution.status !== 'passed') {
            return NextResponse.json(
                { error: 'Only passed resolutions can be signed' },
                { status: 400 }
            );
        }

        // Verify board member belongs to organization
        const { data: boardMember } = await supabase
            .from('board_members')
            .select('id')
            .eq('id', board_member_id)
            .eq('organization_id', resolution.organization_id)
            .single();

        if (!boardMember) {
            return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
        }

        // Capture audit trail data
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Create signature
        const { data: signature, error } = await supabase
            .from('signatures')
            .insert({
                resolution_id: resolutionId,
                board_member_id,
                signature_data,
                signature_type,
                typed_name,
                ip_address: ipAddress,
                user_agent: userAgent,
            })
            .select(`
                *,
                board_member:board_members (
                    id,
                    full_name,
                    avatar_url,
                    position
                )
            `)
            .single();

        if (error) {
            // Check for unique constraint violation
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'You have already signed this resolution' },
                    { status: 409 }
                );
            }
            console.error('Error creating signature:', error);
            return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
        }

        return NextResponse.json({ signature }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
