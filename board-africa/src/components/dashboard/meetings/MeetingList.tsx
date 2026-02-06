'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MeetingCard } from './MeetingCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface MeetingListProps {
    meetings: {
        id: string;
        title: string;
        meeting_type: 'regular' | 'special' | 'emergency' | 'annual';
        status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
        meeting_date: string;
        description?: string | null;
        location?: string | null;
        agenda?: string | null;
        meeting_attendees?: any[];
        action_items?: any[];
    }[];
    onDelete?: (id: string) => void;
}

export function MeetingList({ meetings, onDelete }: MeetingListProps) {
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Debounce search query (300ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // ✅ OPTIMIZED: Memoize filtered meetings - only recalculates when deps change
    const filteredMeetings = useMemo(() =>
        meetings.filter((meeting) => {
            const matchesSearch =
                searchQuery === '' ||
                meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
            const matchesType = typeFilter === 'all' || meeting.meeting_type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        }),
        [meetings, searchQuery, statusFilter, typeFilter]
    );

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ OPTIMIZED: Memoize grouping - only recalculates when filteredMeetings changes
    const { upcomingMeetings, pastMeetings } = useMemo(() => {
        // Use a stable reference for "now" during SSR to avoid hydration mismatch
        const now = isMounted ? new Date() : new Date(0); // Epoch or a fixed date for SSR

        return {
            upcomingMeetings: filteredMeetings.filter((meeting) => {
                const meetingDate = new Date(meeting.meeting_date);
                return isMounted && meetingDate >= now && meeting.status === 'upcoming';
            }),
            pastMeetings: filteredMeetings.filter((meeting) => {
                const meetingDate = new Date(meeting.meeting_date);
                return !isMounted || (meetingDate < now || meeting.status !== 'upcoming');
            }),
        };
    }, [filteredMeetings, isMounted]);

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search meetings..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="special">Special</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Count */}
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? (
                <p className="text-sm text-muted-foreground">
                    Found {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
                </p>
            ) : null}

            {/* Empty State */}
            {filteredMeetings.length === 0 && (
                <EmptyState
                    icon={Search}
                    title="No meetings found"
                    description={
                        searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first meeting'
                    }
                />
            )}

            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {upcomingMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} meeting={meeting} onDelete={onDelete} />
                        ))}
                    </div>
                </div>
            )}

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Past Meetings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pastMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} meeting={meeting} onDelete={onDelete} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
