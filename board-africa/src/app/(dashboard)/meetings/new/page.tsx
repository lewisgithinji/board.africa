import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { MeetingForm } from '@/components/dashboard/meetings/MeetingForm';
import { MeetingFormSkeleton } from '@/components/dashboard/meetings/MeetingSkeletons';

export const metadata = {
    title: 'New Meeting | Board.Africa',
    description: 'Create a new board meeting',
};

async function NewMeetingContent() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch board members for attendee selection
    const { data: boardMembers, error } = await supabase
        .from('board_members')
        .select('*')
        .eq('organization_id', user.id)
        .eq('status', 'active')
        .order('full_name');

    if (error) {
        console.error('Error fetching board members:', error);
        throw new Error('Failed to load board members');
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/meetings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Meeting</h1>
                    <p className="text-muted-foreground">Create a new board meeting</p>
                </div>
            </div>

            {/* Form */}
            <MeetingForm boardMembers={boardMembers || []} />
        </>
    );
}

export default function NewMeetingPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <Suspense fallback={<MeetingFormSkeleton />}>
                <NewMeetingContent />
            </Suspense>
        </div>
    );
}
