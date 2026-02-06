import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { boardMemberUpdateSchema } from '@/lib/validations/organization';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/board-members/[id] - Fetch single board member
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const params = await context.params;
        const memberId = params.id;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch board member
        const { data: member, error } = await supabase
            .from('board_members')
            .select('*')
            .eq('id', memberId)
            .eq('organization_id', user.id)
            .single();

        if (error || !member) {
            return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
        }

        return NextResponse.json({ member });
    } catch (error) {
        console.error('GET /api/board-members/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/board-members/[id] - Update board member
export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const params = await context.params;
        const memberId = params.id;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('board_members')
            .select('id')
            .eq('id', memberId)
            .eq('organization_id', user.id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = boardMemberUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Update board member
        const { data: member, error } = await supabase
            .from('board_members')
            .update(data)
            .eq('id', memberId)
            .eq('organization_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating board member:', error);
            return NextResponse.json({ error: 'Failed to update board member' }, { status: 500 });
        }

        return NextResponse.json({ member });
    } catch (error) {
        console.error('PATCH /api/board-members/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/board-members/[id] - Remove board member
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const params = await context.params;
        const memberId = params.id;

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete board member (RLS ensures user owns it)
        const { error } = await supabase
            .from('board_members')
            .delete()
            .eq('id', memberId)
            .eq('organization_id', user.id);

        if (error) {
            console.error('Error deleting board member:', error);
            return NextResponse.json({ error: 'Failed to delete board member' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('DELETE /api/board-members/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
