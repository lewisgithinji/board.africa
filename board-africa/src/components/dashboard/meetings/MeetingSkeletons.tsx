export function MeetingFormSkeleton() {
    return (
        <div className="space-y-6 max-w-4xl animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-64" />
            </div>

            {/* Form Sections */}
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="p-6 border rounded-lg space-y-4">
                    <div className="h-6 bg-muted rounded w-32" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-10 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-10 bg-muted rounded" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-20 bg-muted rounded" />
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="p-6 border rounded-lg space-y-4">
                    <div className="h-6 bg-muted rounded w-40" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded" />
                    </div>
                </div>

                {/* Attendees Section */}
                <div className="p-6 border rounded-lg space-y-4">
                    <div className="h-6 bg-muted rounded w-32" />
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MeetingListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-64 animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>

            {/* Search/Filters */}
            <div className="flex gap-3">
                <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
                <div className="w-36 h-10 bg-muted rounded animate-pulse" />
                <div className="w-36 h-10 bg-muted rounded animate-pulse" />
            </div>

            {/* Meeting Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="h-6 bg-muted rounded w-3/4" />
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 bg-muted rounded" />
                                    <div className="h-5 w-20 bg-muted rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                        </div>
                        <div className="flex gap-4">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-4 bg-muted rounded w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MeetingDetailsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-9 bg-muted rounded w-64" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-muted rounded" />
                        <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                </div>
                <div className="h-10 w-24 bg-muted rounded" />
            </div>

            {/* Details Card */}
            <div className="border rounded-lg p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-32" />
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                </div>
            </div>

            {/* Tabs */}
            <div className="space-y-4">
                <div className="flex gap-2 border-b">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 w-24 bg-muted rounded-t" />
                    ))}
                </div>
                <div className="border rounded-lg p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-40" />
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
