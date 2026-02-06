'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Download, Mail } from 'lucide-react';
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from '@/lib/calendar/ics-generator';
import type { Meeting } from '@/lib/types/database.types';

interface AddToCalendarButtonProps {
    meeting: Meeting;
}

export function AddToCalendarButton({ meeting }: AddToCalendarButtonProps) {
    const handleDownloadICS = () => {
        window.open(`/api/meetings/${meeting.id}/calendar`, '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold shadow-sm">
                    <CalendarPlus className="h-4 w-4" />
                    Add to Calendar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-200 shadow-2xl">
                <DropdownMenuItem
                    className="rounded-lg py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                    onClick={() => window.open(getGoogleCalendarUrl(meeting), '_blank')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            G
                        </div>
                        <span className="font-semibold">Google Calendar</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="rounded-lg py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                    onClick={() => window.open(getOutlookCalendarUrl(meeting), '_blank')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            O
                        </div>
                        <span className="font-semibold">Outlook / Office 365</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="rounded-lg py-3 cursor-pointer focus:bg-slate-50"
                    onClick={handleDownloadICS}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Download className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Download .ics file</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
