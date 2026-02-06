import { createClient } from '@/lib/supabase/server';
import { EvaluationDashboard } from '@/components/dashboard/evaluations/EvaluationDashboard';

export default async function EvaluationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch in parallel: templates, evaluations, board members
    const [templatesRes, evaluationsRes, membersRes] = await Promise.all([
        supabase
            .from('evaluation_templates')
            .select('*')
            .eq('organization_id', user?.id)
            .order('created_at', { ascending: false }),

        supabase
            .from('evaluations')
            .select(`
                *,
                evaluation_templates(title, description, evaluation_type, questions),
                board_members(id, full_name, position, avatar_url)
            `)
            .eq('organization_id', user?.id)
            .order('created_at', { ascending: false }),

        supabase
            .from('board_members')
            .select('id, full_name, position')
            .eq('organization_id', user?.id)
            .eq('status', 'active'),
    ]);

    const templates = templatesRes.data || [];
    const evaluations = evaluationsRes.data || [];
    const boardMembers = membersRes.data || [];

    return (
        <div className="max-w-6xl mx-auto">
            <EvaluationDashboard
                evaluations={evaluations}
                templates={templates}
                boardMembers={boardMembers}
            />
        </div>
    );
}
