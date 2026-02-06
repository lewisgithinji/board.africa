import { createClient, getUser, getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfessionalProfileEditor } from '@/components/dashboard/profile/ProfessionalProfileEditor';

export default async function ProfessionalProfilePage() {
    const user = await getUser();
    if (!user) return null; // Auth gated by (dashboard)/layout.tsx

    const profile = await getProfile(user.id);

    if (profile?.role !== 'professional') {
        redirect('/dashboard');
    }

    const supabase = await createClient();

    const [professionalProfileResult, experiencesResult, skillsResult, certificationsResult] = await Promise.all([
        supabase
            .from('professional_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single(),

        supabase
            .from('experiences')
            .select('*')
            .eq('profile_id', user.id)
            .order('start_date', { ascending: false }),

        supabase
            .from('skills')
            .select('*')
            .eq('profile_id', user.id),

        supabase
            .from('certifications')
            .select('*')
            .eq('profile_id', user.id),
    ]);

    const professionalProfile = professionalProfileResult.data;
    const experiences = experiencesResult.data;
    const skills = skillsResult.data;
    const certifications = certificationsResult.data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Professional Profile</h1>
                <p className="text-muted-foreground">
                    Manage your board-ready profile and marketplace visibility.
                </p>
            </div>

            <ProfessionalProfileEditor
                initialProfile={professionalProfile || { profile_id: user.id }}
                initialExperiences={experiences || []}
                initialSkills={skills || []}
                initialCertifications={certifications || []}
            />
        </div>
    );
}
