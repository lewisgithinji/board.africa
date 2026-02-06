import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { boardMemberSchema } from '@/lib/validations/organization';
import type { BoardMemberInsert } from '@/lib/types/database.types';

// GET /api/board-members - List board members for user's organization
export async function GET(request: NextRequest) {
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

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('board_members')
            .select('*', { count: 'exact' })
            .eq('organization_id', user.id)
            .order('display_order', { ascending: true });

        // Apply filters
        if (status && ['active', 'inactive', 'pending'].includes(status)) {
            query = query.eq('status', status);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: members, error, count } = await query;

        if (error) {
            console.error('Error fetching board members:', error);
            return NextResponse.json({ error: 'Failed to fetch board members' }, { status: 500 });
        }

        return NextResponse.json({
            members: members || [],
            total: count || 0,
            limit,
            offset,
        });
    } catch (error) {
        console.error('GET /api/board-members error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/board-members - Add new board member
export async function POST(request: NextRequest) {
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

        // Verify user has an organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', user.id)
            .single();

        if (orgError || !org) {
            return NextResponse.json(
                { error: 'Organization not found. Please complete onboarding first.' },
                { status: 404 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = boardMemberSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Get current max display_order
        const { data: maxOrderMember } = await supabase
            .from('board_members')
            .select('display_order')
            .eq('organization_id', user.id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = maxOrderMember ? maxOrderMember.display_order + 1 : 0;

        // Create board member
        const memberData: BoardMemberInsert = {
            organization_id: user.id,
            full_name: data.full_name,
            email: data.email || null,
            phone: data.phone || null,
            avatar_url: data.avatar_url || null,
            position: data.position,
            custom_position: data.custom_position || null,
            department: data.department || null,
            bio: data.bio || null,
            linkedin_url: data.linkedin_url || null,
            qualifications: data.qualifications || null,
            status: data.status || 'active',
            start_date: data.start_date,
            end_date: data.end_date || null,
            term_length: data.term_length || null,
            is_independent: data.is_independent || false,
            committees: data.committees || null,
            display_order: data.display_order ?? nextOrder,
            show_on_public_profile: data.show_on_public_profile ?? true,
        };

        const { data: member, error } = await supabase
            .from('board_members')
            .insert(memberData)
            .select()
            .single();

        if (error) {
            console.error('Error creating board member:', error);
            return NextResponse.json({ error: 'Failed to create board member' }, { status: 500 });
        }

        return NextResponse.json({ member }, { status: 201 });
    } catch (error) {
        console.error('POST /api/board-members error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
