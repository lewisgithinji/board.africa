import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If profile doesn't exist, something went wrong during signup
        redirect('/login');
    }

    // If onboarding is already complete, redirect to dashboard
    if (profile.onboarding_completed) {
        redirect('/dashboard');
    }

    return (
        <main>
            <OnboardingWizard userId={user.id} userEmail={user.email || ''} />
        </main>
    );
}
