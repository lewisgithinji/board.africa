'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BoardMemberForm } from '@/components/dashboard/board-members/BoardMemberForm';
import type { BoardMemberCreate } from '@/lib/validations/organization';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBoardMemberPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(data: BoardMemberCreate) {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/board-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create board member');
            }

            const result = await res.json();
            toast.success(`${result.member.full_name} added successfully`);
            router.push('/board-members');
            router.refresh();
        } catch (error) {
            console.error('Error creating board member:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add board member');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/board-members">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Board Members
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add Board Member</h1>
                <p className="text-muted-foreground mt-2">
                    Add a new member to your organization's board or committee
                </p>
            </div>

            <Separator />

            <BoardMemberForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Add Member" />
        </div>
    );
}
