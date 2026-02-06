'use client';

import { Suspense } from 'react';
import { DocumentList } from '@/components/dashboard/documents/DocumentList';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with branding/stats */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border p-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Resource Center</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Board Documents
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Securely manage and access your organization's board materials, financial reports, and legal documentation.
                        </p>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            }>
                <DocumentList />
            </Suspense>
        </div>
    );
}
