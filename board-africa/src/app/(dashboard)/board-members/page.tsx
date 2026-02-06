'use client';

import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BoardMemberList } from '@/components/dashboard/board-members/BoardMemberList';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BoardMember } from '@/lib/types/database.types';
import { Plus, Users, UserPlus } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch board members');
    return res.json();
};

export default function BoardMembersPage() {
    const router = useRouter();
    const [memberToDelete, setMemberToDelete] = useState<BoardMember | null>(null);

    // Fetch members with SWR
    const { data, error, isLoading, mutate } = useSWR('/api/board-members', fetcher, {
        revalidateOnFocus: false,
    });

    const members: BoardMember[] = data?.members || [];

    // ✅ OPTIMIZED: Memoize stats calculation - only recalculates when members change
    const stats = useMemo(() => ({
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        pending: members.filter(m => m.status === 'pending').length,
    }), [members]);

    // ✅ OPTIMIZED: Stable callback references
    const handleEdit = useCallback((member: BoardMember) => {
        router.push(`/board-members/${member.id}/edit`);
    }, [router]);

    const handleDeleteClick = useCallback((member: BoardMember) => {
        setMemberToDelete(member);
    }, []);

    // Handle delete with optimistic update
    const handleDelete = useCallback(async (member: BoardMember) => {
        try {
            // Optimistic update
            const optimisticData = {
                members: members.filter(m => m.id !== member.id)
            };

            mutate(async () => {
                const res = await fetch(`/api/board-members/${member.id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Failed to delete member');
                }

                toast.success('Board member deleted successfully');
                return optimisticData;
            }, { optimisticData, revalidate: false });

            setMemberToDelete(null);
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to delete member');
            mutate(); // Revalidate on error
        }
    }, [members, mutate]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Board Members"
                description="Manage your organization's board composition and committees."
                badge="Directory"
            >
                <Button
                    onClick={() => router.push('/board-members/new')}
                    size="lg"
                    className="shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all rounded-full px-6"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </PageHeader>

            <Separator />

            {/* Stats Cards - Only show if there are members */}
            {members.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Members List or Empty State */}
            {members.length === 0 ? (
                <EmptyState
                    icon={UserPlus}
                    title="No board members yet"
                    description="Get started by adding your first board member. You can add directors, executives, and committee members to your organization."
                    action={{
                        label: 'Add First Member',
                        onClick: () => router.push('/board-members/new'),
                        icon: Plus,
                    }}
                />
            ) : (
                <BoardMemberList
                    members={members}
                    isLoading={false}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Board Member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {memberToDelete?.full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => memberToDelete && handleDelete(memberToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
