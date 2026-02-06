'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, FileText, Upload, Users, Video } from 'lucide-react';

const ACTIONS = [
    {
        title: 'Schedule Meeting',
        icon: Calendar,
        href: '/meetings/new',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        title: 'Upload Policy',
        icon: Upload,
        href: '/documents?upload=true',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        title: 'Add Member',
        icon: Users,
        href: '/board-members/new',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
    },
    {
        title: 'Draft Minutes',
        icon: FileText,
        href: '/meetings?tab=minutes',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
];

export function QuickActionsGrid() {
    return (
        <Card className="border-none shadow-lg shadow-indigo-500/5">
            <CardHeader>
                <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                {ACTIONS.map((action) => (
                    <Link key={action.title} href={action.href} className="block">
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 hover:shadow-md transition-all duration-200 cursor-pointer h-full group">
                            <div className={`p-3 rounded-xl mb-3 ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-center text-slate-700">{action.title}</span>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
