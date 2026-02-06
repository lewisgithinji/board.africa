import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createCalendarEventSchema } from '@/lib/validations/compliance';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const status = url.searchParams.get('status');

        let query = supabase
            .from('compliance_calendar_events')
            .select('*, compliance_regulations(title, country, category)')
            .eq('organization_id', user.id)
            .order('due_date', { ascending: true });

        if (status) query = query.eq('status', status);

        const { data } = await query;
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const parsed = createCalendarEventSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('compliance_calendar_events')
            .insert({
                organization_id: user.id,
                regulation_id: parsed.data.regulation_id || null,
                title: parsed.data.title,
                description: parsed.data.description || null,
                event_type: parsed.data.event_type,
                due_date: parsed.data.due_date,
            })
            .select('*, compliance_regulations(title, country, category)')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
