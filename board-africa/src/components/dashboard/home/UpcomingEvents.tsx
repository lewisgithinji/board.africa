'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface Meeting {
    id: string;
    title: string;
    meeting_date: string;
    location?: string | null;
}

interface UpcomingEventsProps {
    meetings: Meeting[];
}

export function UpcomingEvents({ meetings }: UpcomingEventsProps) {
    if (meetings.length === 0) {
        return (
            <Card className="border-none shadow-lg shadow-indigo-500/5 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-bold">Upcoming</CardTitle>
                    <Link href="/meetings/new">
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                            + New
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Calendar className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No events scheduled</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[150px]">
                        Your upcoming board meetings will appear here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg shadow-indigo-500/5 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold">Upcoming</CardTitle>
                <Link href="/meetings">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700">
                        View all
                        <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {meetings.map((meeting) => {
                    const date = new Date(meeting.meeting_date);
                    return (
                        <div key={meeting.id} className="flex gap-4 items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -mx-2">
                            {/* Date Leaf */}
                            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 group-hover:scale-105 transition-all">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span className="text-xl font-extrabold leading-none">{date.getDate()}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{meeting.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                    {meeting.location && (
                                        <span className="flex items-center gap-1 truncate max-w-[100px]">
                                            <MapPin className="h-3 w-3" />
                                            {meeting.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link href={`/meetings/${meeting.id}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
