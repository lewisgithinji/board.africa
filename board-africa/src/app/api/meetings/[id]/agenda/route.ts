import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAgendaItemSchema, bulkUpdateAgendaItemsSchema } from '@/lib/validations/agenda';

/**
 * GET /api/meetings/[id]/agenda
 * List all agenda items for a meeting
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: meetingId } = await params;
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

        // Get agenda items with details
        const { data: agendaItems, error } = await supabase
            .from('agenda_items')
            .select(`
                *,
                presenter:board_members(*),
                document:documents(*),
                resolution:resolutions(*)
            `)
            .eq('meeting_id', meetingId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching agenda items:', error);
            return NextResponse.json({ error: 'Failed to fetch agenda items' }, { status: 500 });
        }

        return NextResponse.json({ agendaItems: agendaItems || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/meetings/[id]/agenda
 * Create a new agenda item
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: meetingId } = await params;
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

        const body = await request.json();
        const validationResult = createAgendaItemSchema.safeParse({ ...body, meeting_id: meetingId });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Verify meeting belongs to organization
        const { data: meeting, error: meetError } = await supabase
            .from('meetings')
            .select('id')
            .eq('id', meetingId)
            .eq('organization_id', user.id)
            .single();

        if (meetError || !meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Create agenda item
        const { data: agendaItem, error } = await supabase
            .from('agenda_items')
            .insert(validationResult.data)
            .select()
            .single();

        if (error) {
            console.error('Error creating agenda item:', error);
            return NextResponse.json({ error: 'Failed to create agenda item' }, { status: 500 });
        }

        return NextResponse.json({ agendaItem }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/meetings/[id]/agenda
 * Bulk update agenda items (for reordering)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: meetingId } = await params;
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

        // Verify meeting belongs to organization
        const { data: meeting, error: meetError } = await supabase
            .from('meetings')
            .select('id')
            .eq('id', meetingId)
            .eq('organization_id', user.id)
            .single();

        if (meetError || !meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        const body = await request.json();
        const validationResult = bulkUpdateAgendaItemsSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Perform updates in a batch (using upsert or multiple calls)
        // Note: Supabase doesn't have a built-in multiple individual updates in one go easily via API
        // So we'll use a transaction via a RPC or multiple promises.
        // For simplicity and to follow the current pattern, we'll use Promise.all.
        // In a real production app with many items, a custom Postgres function would be better.

        const updates = validationResult.data.map(item =>
            supabase
                .from('agenda_items')
                .update({ order_index: item.order_index, parent_id: item.parent_id })
                .eq('id', item.id)
                .eq('meeting_id', meetingId)
        );

        const results = await Promise.all(updates);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
            console.error('Errors during bulk update:', errors);
            return NextResponse.json({ error: 'Failed to update some agenda items' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
