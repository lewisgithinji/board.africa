import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-8">
            {/* Page Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Left Column */}
                <div className="col-span-4 space-y-4">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-96 rounded-lg" />
                </div>

                {/* Right Column */}
                <div className="col-span-3 space-y-4">
                    <Skeleton className="h-80 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
