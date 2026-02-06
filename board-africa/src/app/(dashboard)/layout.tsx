import { getUser, getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SkipToContent } from '@/lib/utils/SkipToContent';
import { CommandPalette } from '@/components/search/command-palette';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await getProfile(user.id);

    // Redirect to onboarding if not completed
    if (!profile?.onboarding_completed) {
        redirect('/onboarding');
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            <SkipToContent />
            <CommandPalette />
            <DashboardSidebar
                user={{
                    email: user.email || '',
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                    role: profile.role,
                }}
            />

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Mobile header spacing */}
                <div className="lg:hidden h-16" />

                {/* Page Content */}
                <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
