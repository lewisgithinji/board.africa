'use client';

import { useState, useEffect, useMemo } from 'react';
import type { BoardMember } from '@/lib/types/database.types';
import { BoardMemberCard } from './BoardMemberCard';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface BoardMemberListProps {
    members: BoardMember[];
    onEdit?: (member: BoardMember) => void;
    onDelete?: (member: BoardMember) => void;
    onReorder?: (memberIds: string[]) => void;
    isLoading?: boolean;
}

export function BoardMemberList({
    members,
    onEdit,
    onDelete,
    onReorder,
    isLoading,
}: BoardMemberListProps) {
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // ✅ OPTIMIZED: Debounce search (300ms) - reduces re-renders during typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // ✅ OPTIMIZED: Memoize filtered members - only recalculates when deps change
    const filteredMembers = useMemo(() =>
        members.filter((member) => {
            const matchesSearch = debouncedSearch === '' ||
                member.full_name.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
            return matchesSearch && matchesStatus;
        }),
        [members, debouncedSearch, statusFilter]
    );

    // Empty state
    if (!isLoading && members.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No board members yet</h3>
                <p className="text-muted-foreground mb-4">
                    Add your first board member to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Members Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No members match your filters</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map((member) => (
                        <BoardMemberCard
                            key={member.id}
                            member={member}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDraggable={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
