import { format } from 'date-fns';
import type { Meeting } from '@/lib/types/database.types';

export function generateICS(meeting: Meeting): string {
    const startDate = new Date(meeting.meeting_date);
    const endDate = new Date(startDate.getTime() + (meeting.duration_minutes || 60) * 60 * 1000);

    const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BoardAfrica//NONSGML Meeting//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${meeting.id}@board.africa`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${meeting.title}`,
        `DESCRIPTION:${(meeting.description || '').replace(/\n/g, '\\n')}`,
        `LOCATION:${meeting.location || 'Online'}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return lines.join('\r\n');
}

export function getGoogleCalendarUrl(meeting: Meeting): string {
    const startDate = new Date(meeting.meeting_date);
    const endDate = new Date(startDate.getTime() + (meeting.duration_minutes || 60) * 60 * 1000);

    const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
        text: meeting.title,
        dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
        details: meeting.description || '',
        location: meeting.location || '',
    });

    return `${baseUrl}&${params.toString()}`;
}

export function getOutlookCalendarUrl(meeting: Meeting): string {
    const startDate = new Date(meeting.meeting_date);
    const endDate = new Date(startDate.getTime() + (meeting.duration_minutes || 60) * 60 * 1000);

    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
        subject: meeting.title,
        startdt: startDate.toISOString(),
        enddt: endDate.toISOString(),
        body: meeting.description || '',
        location: meeting.location || '',
        path: '/calendar/action/compose',
        rru: 'addevent',
    });

    return `${baseUrl}?${params.toString()}`;
}
