import { Metadata } from 'next';
import { LibraryList } from '@/components/dashboard/library/LibraryList';

export const metadata: Metadata = {
    title: 'Policy Library | Board.Africa',
    description: 'Organization policies and permanent documents',
};

export default function LibraryPage() {
    return (
        <div className="flex flex-col h-full gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Policy Library
                </h1>
                <p className="text-muted-foreground">
                    Access and manage your organization's permanent documents, policies, and charters.
                </p>
            </div>

            <div className="flex-1">
                <LibraryList />
            </div>
        </div>
    );
}
