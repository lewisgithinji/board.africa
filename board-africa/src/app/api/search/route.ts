import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const type = searchParams.get('type'); // optional filter by type

        if (!query || query.length < 2) {
            return NextResponse.json({ results: {}, total: 0 });
        }

        // Get current user's organization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('current_organization_id')
            .eq('id', user.id)
            .single();

        if (!profile?.current_organization_id) {
            return NextResponse.json({ results: {}, total: 0 });
        }

        // Search using PostgreSQL full-text search
        let searchQuery = supabase
            .from('search_index')
            .select('*')
            .eq('organization_id', profile.current_organization_id)
            .textSearch('search_vector', query, {
                type: 'websearch',
                config: 'english'
            })
            .order('created_at', { ascending: false })
            .limit(50);

        if (type) {
            searchQuery = searchQuery.eq('type', type);
        }

        const { data, error } = await searchQuery;

        if (error) {
            console.error('Search error:', error);
            return NextResponse.json({ error: 'Search failed' }, { status: 500 });
        }

        // Group results by type
        const grouped = {
            meetings: data?.filter(r => r.type === 'meeting') || [],
            documents: data?.filter(r => r.type === 'document') || [],
            action_items: data?.filter(r => r.type === 'action_item') || [],
            resolutions: data?.filter(r => r.type === 'resolution') || [],
        };

        return NextResponse.json({ results: grouped, total: data?.length || 0 });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
