import { use, Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { MeetingForm } from '@/components/dashboard/meetings/MeetingForm';
import { MeetingFormSkeleton } from '@/components/dashboard/meetings/MeetingSkeletons';

export const metadata = {
    title: 'Edit Meeting | Board.Africa',
    description: 'Edit board meeting',
};

async function EditMeetingContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch meeting
    const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .eq('organization_id', user.id)
        .single();

    if (meetingError || !meeting) {
        notFound();
    }

    // Fetch board members
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
                    <Link href={`/meetings/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Meeting</h1>
                    <p className="text-muted-foreground">Update meeting details</p>
                </div>
            </div>

            {/* Form */}
            <MeetingForm meeting={meeting} boardMembers={boardMembers || []} />
        </>
    );
}

export default function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="space-y-6 max-w-4xl">
            <Suspense fallback={<MeetingFormSkeleton />}>
                <EditMeetingContent params={params} />
            </Suspense>
        </div>
    );
}
