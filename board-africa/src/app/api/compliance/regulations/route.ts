import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const country = url.searchParams.get('country');
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');

        let query = supabase
            .from('compliance_regulations')
            .select('*')
            .order('country', { ascending: true });

        if (country) query = query.eq('country', country);
        if (category) query = query.eq('category', category);
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data } = await query;
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
