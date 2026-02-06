'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Building2,
    Calendar,
    LayoutDashboard,
    LogOut,
    Menu,
    Files,
    Settings,
    Users,
    Book,
    Briefcase,
    UserCircle,
    ShoppingBag,
    GraduationCap,
    ClipboardCheck,
    ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
    user: {
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        role?: 'organization' | 'professional' | 'admin' | null;
    };
}

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        title: 'Organization',
        icon: Building2,
        href: '/settings/organization',
    },
    {
        title: 'Board Members',
        icon: Users,
        href: '/board-members',
    },
    {
        title: 'Meetings',
        icon: Calendar,
        href: '/meetings',
    },
    {
        title: 'Documents',
        icon: Files,
        href: '/documents',
    },
    {
        title: 'Evaluations',
        icon: ClipboardCheck,
        href: '/evaluations',
    },
    {
        title: 'Training & Courses',
        icon: GraduationCap,
        href: '/courses',
    },
    {
        title: 'Policy Library',
        icon: Book,
        href: '/library',
    },
    {
        title: 'Compliance',
        icon: ShieldCheck,
        href: '/compliance',
    },
    {
        title: 'Marketplace',
        icon: ShoppingBag,
        href: '/marketplace',
    },
    {
        title: 'Professional Profile',
        icon: UserCircle,
        href: '/profile/professional',
        role: 'professional',
    },
    {
        title: 'Board Vacancies',
        icon: Briefcase,
        href: '/marketplace/vacancies',
        role: 'organization',
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];

function SidebarContent({ user }: SidebarProps) {
    const pathname = usePathname();

    const initials = user.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || user.email.slice(0, 2).toUpperCase();

    return (
        <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="text-lg">Board.Africa</span>
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                    {menuItems.filter(item => !item.role || item.role === user.role).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* User Profile & Sign Out */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate capitalize">
                            {user.role || 'No Role'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7 text-muted-foreground"
                        onClick={async () => {
                            const newRole = user.role === 'organization' ? 'professional' : 'organization';
                            const supabase = (await import('@/lib/supabase/client')).createClient();
                            await supabase.from('profiles').update({ role: newRole }).eq('email', user.email);
                            window.location.reload();
                        }}
                    >
                        <Users className="mr-2 h-3 w-3" />
                        Switch to {user.role === 'organization' ? 'Professional' : 'Organization'}
                    </Button>

                    <form action="/auth/signout" method="post">
                        <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function DashboardSidebar({ user }: SidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="text-lg">Board.Africa</span>
                </Link>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent user={user} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r bg-card">
                <SidebarContent user={user} />
            </aside>
        </>
    );
}
