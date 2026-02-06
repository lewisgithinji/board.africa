import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { documentSchema, documentFilterSchema } from '@/lib/validations/document';

/**
 * GET /api/documents
 * List all documents for the current user's organization with filters
 */
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
        const { searchParams } = new URL(request.url);
        const searchParamsObj: Record<string, any> = {};
        searchParams.forEach((value, key) => {
            if (key === 'is_public') {
                searchParamsObj[key] = value === 'true';
            } else if (key === 'is_library_item') {
                searchParamsObj[key] = value === 'true';
            } else if (key === 'limit' || key === 'offset') {
                searchParamsObj[key] = value;
            } else {
                searchParamsObj[key] = value;
            }
        });

        // Validate filters
        const validationResult = documentFilterSchema.safeParse(searchParamsObj);
        const filters = validationResult.success ? validationResult.data : {};

        // Build query
        let query = supabase
            .from('documents')
            .select('*', { count: 'exact' })
            .eq('organization_id', user.id);

        // Apply filters
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.meeting_id) {
            query = query.eq('meeting_id', filters.meeting_id);
        }
        if (filters.board_member_id) {
            query = query.eq('board_member_id', filters.board_member_id);
        }
        if (filters.is_public !== undefined) {
            query = query.eq('is_public', filters.is_public);
        }
        if (filters.is_library_item !== undefined) {
            query = query.eq('is_library_item', filters.is_library_item);
        }
        if (filters.library_category) {
            query = query.eq('library_category', filters.library_category);
        }
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        // Apply pagination
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: documents, error, count } = await query;

        if (error) {
            console.error('Error fetching documents:', error);
            return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
        }

        return NextResponse.json({
            documents,
            total: count,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/documents
 * Create a new document metadata record
 */
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

        // Parse and validate request body
        const body = await request.json();
        const validationResult = documentSchema.safeParse(body);

        if (!validationResult.success) {
            console.error('Validation failed for document:', validationResult.error.flatten().fieldErrors);
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const documentData = validationResult.data;

        // Create document entry
        const { data: document, error } = await supabase
            .from('documents')
            .insert({
                ...documentData,
                organization_id: user.id,
                uploaded_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating document record:', error);
            return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
        }

        return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
