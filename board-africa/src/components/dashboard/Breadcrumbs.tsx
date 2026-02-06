'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
    ];

    let currentPath = '';
    for (let i = 0; i < paths.length; i++) {
        const segment = paths[i];
        currentPath += `/${segment}`;

        // Skip if it's just 'dashboard'
        if (segment === 'dashboard') continue;

        // Format the label
        let label = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Special cases
        if (segment === 'board-members') label = 'Board Members';
        if (segment === 'organization') label = 'Organization';
        if (segment === 'settings') label = 'Settings';
        if (segment === 'new') label = 'New';
        if (segment === 'edit') label = 'Edit';

        // Only add href if it's not the last item
        breadcrumbs.push({
            label,
            href: i < paths.length - 1 ? currentPath : undefined,
        });
    }

    return breadcrumbs;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const pathname = usePathname();
    const breadcrumbs = items || generateBreadcrumbs(pathname);

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.slice(1).map((item, index) => (
                <Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-foreground">{item.label}</span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
