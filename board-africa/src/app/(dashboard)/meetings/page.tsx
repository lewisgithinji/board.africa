import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { createClient, getUser } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { MeetingList } from '@/components/dashboard/meetings/MeetingList';
import { EmptyState } from '@/components/ui/EmptyState';
import { MeetingListSkeleton } from '@/components/dashboard/meetings/MeetingSkeletons';
import { PageHeader } from '@/components/ui/PageHeader';


export const metadata = {
    title: 'Meetings | Board.Africa',
    description: 'Manage your board meetings',
};

async function MeetingsContent() {
    const user = await getUser();
    if (!user) return null; // Auth gated by (dashboard)/layout.tsx

    const supabase = await createClient();

    const { data: meetings, error } = await supabase
        .from('meetings')
        .select(`
      id, title, meeting_type, status, meeting_date, description, location, agenda,
      meeting_attendees (
        id,
        attendance_status,
        board_member:board_members (
          id,
          full_name,
          avatar_url
        )
      ),
      action_items (
        id,
        title,
        status,
        due_date
      )
    `)
        .eq('organization_id', user.id)
        .order('meeting_date', { ascending: false });

    if (error) {
        console.error('Error fetching meetings:', error);
        throw new Error('Failed to load meetings');
    }

    return (
        <>
            {/* Header */}
            <PageHeader
                title="Meetings"
                description="Schedule, manage, and track your board meetings."
                badge="Governance"
            >
                <Button asChild size="lg" className="shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all rounded-full px-6">
                    <Link href="/meetings/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Meeting
                    </Link>
                </Button>
            </PageHeader>

            {/* Content */}
            {meetings && meetings.length > 0 ? (
                <MeetingList meetings={meetings} />
            ) : (
                <EmptyState
                    icon={Calendar}
                    title="No meetings yet"
                    description="Get started by creating your first board meeting."
                >
                    <Button asChild>
                        <Link href="/meetings/new">Create Meeting</Link>
                    </Button>
                </EmptyState>
            )}
        </>
    );
}

export default function MeetingsPage() {
    return (
        <div className="space-y-6">
            <Suspense fallback={<MeetingListSkeleton />}>
                <MeetingsContent />
            </Suspense>
        </div>
    );
}
