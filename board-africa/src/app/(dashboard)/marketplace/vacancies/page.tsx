import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function VacanciesDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'organization') {
        redirect('/dashboard');
    }

    // Fetch positions created by this organization
    // Assuming the user is linked to an organization. 
    // In our system, organization_id is often the user's ID if they are the owner/admin, 
    // or they are part of an organization.
    // For now, let's filter by organization_id = user.id OR created_by = user.id
    const { data: positions } = await supabase
        .from('board_positions')
        .select('*, applications(count)')
        .or(`organization_id.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Board Vacancies</h1>
                    <p className="text-muted-foreground">
                        Manage your organization's board openings and review candidate applications.
                    </p>
                </div>
                <Button asChild className="font-bold shadow-lg shadow-primary/10">
                    <Link href="/marketplace/vacancies/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Position
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {!positions || positions.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/5 py-12">
                        <CardContent className="text-center space-y-4">
                            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">No vacancies posted yet</h3>
                                <p className="text-muted-foreground text-sm">Start by posting your first board position to find expert talent.</p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/marketplace/vacancies/new">Create Vacancy</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    positions.map((position) => (
                        <Card key={position.id} className="group hover:border-primary/20 transition-all shadow-sm">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                                    <div className="flex-1 space-y-1 w-full text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={position.status === 'open' ? 'default' : 'outline'} className="capitalize">
                                                {position.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Posted {new Date(position.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{position.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{position.position_type} • {position.location || 'Remote'}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 px-6 border-l hidden md:flex">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-primary">{position.applications?.[0]?.count || 0}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Applications</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none font-semibold">
                                            <Link href={`/marketplace/vacancies/${position.id}/applications`}>
                                                <Users className="mr-2 h-4 w-4" />
                                                View Apps
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none font-semibold">
                                            <Link href={`/marketplace/vacancies/${position.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/5">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
