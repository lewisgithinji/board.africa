import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BoardPositionForm } from '@/components/dashboard/marketplace/BoardPositionForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewVacancyPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/marketplace/vacancies" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group">
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Vacancies
            </Link>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Post a Board Vacancy</h1>
                <p className="text-muted-foreground">
                    Fill in the details to attract the right board-ready professionals.
                </p>
            </div>

            <BoardPositionForm organizationId={user.id} />
        </div>
    );
}
