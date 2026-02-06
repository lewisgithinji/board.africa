import { createClient } from '@/lib/supabase/server';
import { ComplianceDashboard } from '@/components/dashboard/compliance/ComplianceDashboard';

export default async function CompliancePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [regulationsRes, eventsRes, checklistsRes] = await Promise.all([
        supabase
            .from('compliance_regulations')
            .select('*')
            .order('country', { ascending: true }),

        supabase
            .from('compliance_calendar_events')
            .select('*, compliance_regulations(title, country, category)')
            .eq('organization_id', user?.id)
            .order('due_date', { ascending: true }),

        supabase
            .from('compliance_checklists')
            .select('*, compliance_checklist_items(*), compliance_regulations(title, country, category)')
            .eq('organization_id', user?.id)
            .order('created_at', { ascending: false }),
    ]);

    return (
        <div className="max-w-6xl mx-auto">
            <ComplianceDashboard
                regulations={regulationsRes.data || []}
                calendarEvents={eventsRes.data || []}
                checklists={checklistsRes.data || []}
            />
        </div>
    );
}
