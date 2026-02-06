'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

// Lazy load the chart component with SSR disabled
// This must be done in a Client Component to avoid "ssr: false in Server Component" errors
const EngagementChartInternal = dynamic(
    () => import('./EngagementChart').then((mod) => mod.EngagementChart),
    {
        loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl" />,
        ssr: false,
    }
);

export function EngagementChart() {
    return <EngagementChartInternal />;
}
