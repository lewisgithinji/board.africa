'use client';

import { memo, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BoardMember } from '@/lib/types/database.types';
import { Edit, GripVertical, Linkedin, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface BoardMemberCardProps {
    member: BoardMember;
    onEdit?: (member: BoardMember) => void;
    onDelete?: (member: BoardMember) => void;
    isDraggable?: boolean;
}

const positionLabels: Record<string, string> = {
    chairman: 'Chairman',
    vice_chairman: 'Vice Chairman',
    ceo: 'CEO',
    cfo: 'CFO',
    director: 'Director',
    independent_director: 'Independent Director',
    executive_director: 'Executive Director',
    non_executive_director: 'Non-Executive Director',
    secretary: 'Secretary',
    member: 'Member',
    observer: 'Observer',
    other: 'Other',
};

const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
};

// ✅ OPTIMIZED: Wrapped with React.memo to prevent re-renders when props haven't changed
export const BoardMemberCard = memo(function BoardMemberCard({
    member,
    onEdit,
    onDelete,
    isDraggable
}: BoardMemberCardProps) {
    // ✅ OPTIMIZED: Memoize computed values
    const initials = useMemo(() =>
        member.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        [member.full_name]
    );

    const positionDisplay = useMemo(() =>
        member.position === 'other' && member.custom_position
            ? member.custom_position
            : positionLabels[member.position],
        [member.position, member.custom_position]
    );

    return (
        <Card className="relative group hover:shadow-md transition-shadow">
            {isDraggable && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
            )}

            <CardHeader className={isDraggable ? 'pl-10' : ''}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{member.full_name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <span className="truncate">{positionDisplay}</span>
                                {member.department && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate">{member.department}</span>
                                    </>
                                )}
                            </CardDescription>

                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="secondary"
                                    className={`${statusColors[member.status]} text-white text-xs`}
                                >
                                    {member.status}
                                </Badge>
                                {member.is_independent && (
                                    <Badge variant="outline" className="text-xs">
                                        Independent
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(member)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {member.linkedin_url && (
                                <DropdownMenuItem asChild>
                                    <Link href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        View LinkedIn
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(member)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            {member.bio && (
                <CardContent className={isDraggable ? 'pl-10' : ''}>
                    <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                </CardContent>
            )}

            {member.qualifications && member.qualifications.length > 0 && (
                <CardContent className={`${isDraggable ? 'pl-10' : ''} pt-0`}>
                    <div className="flex flex-wrap gap-1">
                        {member.qualifications.slice(0, 3).map((qual, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                {qual}
                            </Badge>
                        ))}
                        {member.qualifications.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{member.qualifications.length - 3} more
                            </Badge>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
});
