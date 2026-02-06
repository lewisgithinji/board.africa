import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createEvaluationSchema } from '@/lib/validations/evaluation';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const status = url.searchParams.get('status');   // draft | submitted
        const subjectId = url.searchParams.get('subject_id');

        let query = supabase
            .from('evaluations')
            .select(`
                *,
                evaluation_templates(title, evaluation_type, questions),
                board_members(id, full_name, position, avatar_url)
            `)
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data: evaluations } = await query;
        return NextResponse.json(evaluations || []);
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
        const parsed = createEvaluationSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        // Verify template belongs to this org
        const { data: template } = await supabase
            .from('evaluation_templates')
            .select('*')
            .eq('id', parsed.data.template_id)
            .eq('organization_id', user.id)
            .single();

        if (!template) return new NextResponse('Template not found', { status: 404 });

        // For peer_review, subject_id is required
        if (template.evaluation_type === 'peer_review' && !parsed.data.subject_id) {
            return NextResponse.json({ error: 'subject_id is required for peer reviews' }, { status: 400 });
        }

        const { data: evaluation, error } = await supabase
            .from('evaluations')
            .insert({
                template_id: parsed.data.template_id,
                organization_id: user.id,
                evaluator_id: user.id,
                subject_id: parsed.data.subject_id || null,
                status: 'draft',
                responses: {},
            })
            .select('*')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(evaluation, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
