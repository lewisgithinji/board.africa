'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    CheckCircle2,
    MoreVertical,
    Edit,
    Trash2,
    Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface MeetingCardProps {
    meeting: {
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
    };
    onDelete?: (id: string) => void;
}

const meetingTypeLabels = {
    regular: 'Regular',
    special: 'Special',
    emergency: 'Emergency',
    annual: 'Annual',
};

const statusColors = {
    upcoming: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm',
    in_progress: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm',
    completed: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm',
    cancelled: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
};

// ✅ OPTIMIZED: Wrapped with React.memo to prevent re-renders when props haven't changed
export const MeetingCard = memo(function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ OPTIMIZED: Memoize date parsing and formatting (expensive operations)
    const { formattedDate, formattedTime, isUpcoming, isPast } = useMemo(() => {
        const meetingDate = new Date(meeting.meeting_date);
        const now = isMounted ? new Date() : new Date(meeting.meeting_date); // Default to meeting date to avoid mismatch if possible, or just handle null

        return {
            formattedDate: format(meetingDate, 'PPP'),
            formattedTime: format(meetingDate, 'p'),
            isUpcoming: isMounted && meetingDate > now && meeting.status === 'upcoming',
            isPast: isMounted && (meetingDate < now && meeting.status !== 'upcoming'),
        };
    }, [meeting.meeting_date, meeting.status, isMounted]);

    // ✅ OPTIMIZED: Memoize counts
    const { attendeeCount, actionItemsCount, completedActionItems } = useMemo(() => ({
        attendeeCount: meeting.meeting_attendees?.length || 0,
        actionItemsCount: meeting.action_items?.length || 0,
        completedActionItems: meeting.action_items?.filter((item) => item.status === 'completed').length || 0,
    }), [meeting.meeting_attendees, meeting.action_items]);

    return (
        <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                        <Link href={`/meetings/${meeting.id}`} className="group/link">
                            <h3 className="font-semibold text-lg leading-tight group-hover/link:text-primary transition-colors">
                                {meeting.title}
                            </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {meetingTypeLabels[meeting.meeting_type]}
                            </Badge>
                            <Badge className={statusColors[meeting.status]}>
                                {meeting.status.replace('_', ' ')}
                            </Badge>
                            {isUpcoming && (
                                <Badge variant="secondary" className="text-xs">
                                    Upcoming
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {(isUpcoming || meeting.status === 'in_progress') && (
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 font-semibold shadow-sm mr-1" asChild>
                                <Link href={`/meetings/${meeting.id}/room`}>
                                    <Video className="h-3.5 w-3.5 mr-1.5" />
                                    Join
                                </Link>
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/meetings/${meeting.id}/edit`} className="flex items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(meeting.id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {meeting.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{meeting.description}</p>
                )}

                {/* Meeting Info */}
                <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{formattedDate}</span>
                        <Clock className="h-4 w-4 ml-2 flex-shrink-0" />
                        <span>{formattedTime}</span>
                    </div>

                    {meeting.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{meeting.location}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
                    {attendeeCount > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{attendeeCount} attendee{attendeeCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {actionItemsCount > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                                {completedActionItems}/{actionItemsCount} actions
                            </span>
                        </div>
                    )}

                    {meeting.agenda && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Agenda set</span>
                        </div>
                    )}
                </div>

                {/* Attendee Avatars */}
                {meeting.meeting_attendees && meeting.meeting_attendees.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                        <div className="flex -space-x-2">
                            {meeting.meeting_attendees.slice(0, 5).map((attendee: any) => (
                                <Avatar key={attendee.id} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={attendee.board_member?.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                        {attendee.board_member?.full_name?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {meeting.meeting_attendees.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                                +{meeting.meeting_attendees.length - 5} more
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
