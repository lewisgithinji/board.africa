import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, MapPin, Calendar, DollarSign, Briefcase, ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { ApplicationFormDialog } from '@/components/dashboard/marketplace/ApplicationFormDialog';

export default async function PositionDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: position } = await supabase
        .from('board_positions')
        .select('*, organizations(*)')
        .eq('id', id)
        .single();

    if (!position) {
        notFound();
    }

    // Get current user to check if they already applied
    const { data: { user } } = await supabase.auth.getUser();

    let existingApplication = null;
    if (user) {
        const { data: app } = await supabase
            .from('applications')
            .select('*')
            .eq('position_id', id)
            .eq('profile_id', user.id)
            .maybeSingle();
        existingApplication = app;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/marketplace" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group">
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Marketplace
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3">
                            {position.position_type}
                        </Badge>
                        {position.is_remunerated && (
                            <Badge variant="default" className="bg-primary">Remunerated</Badge>
                        )}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{position.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-4 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-5 w-5 text-primary/70" />
                            {position.organizations?.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-5 w-5 text-primary/70" />
                            {position.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-5 w-5 text-primary/70" />
                            Deadline: {position.closing_date ? new Date(position.closing_date).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {existingApplication ? (
                    <div className="bg-green-500/10 text-green-600 px-6 py-3 rounded-xl border border-green-500/20 font-bold flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Application Submitted
                    </div>
                ) : (
                    <ApplicationFormDialog positionId={position.id} positionTitle={position.title} />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                <div className="md:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">About the Role</h2>
                        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {position.description}
                        </div>
                    </section>

                    {position.requirements && position.requirements.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">Key Requirements</h2>
                            <ul className="grid grid-cols-1 gap-3">
                                {position.requirements.map((req: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/20 transition-all group">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        <span className="text-muted-foreground font-medium">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {position.compensation_details && (
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">Compensation & Benefits</h2>
                            <div className="p-6 rounded-2xl border bg-primary/5 text-muted-foreground leading-relaxed">
                                {position.compensation_details}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-primary/10 overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg">At a Glance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Company</p>
                                <p className="font-semibold">{position.organizations?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Position Type</p>
                                <p className="font-semibold">{position.position_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Remuneration</p>
                                <p className="font-semibold">{position.is_remunerated ? 'Paid Position' : 'Volunteer / Pro-bono'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Posted On</p>
                                <p className="font-semibold">{new Date(position.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary to-primary-foreground border-none text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Briefcase className="h-24 w-24" />
                        </div>
                        <CardContent className="p-6 space-y-4 relative z-10">
                            <h3 className="font-bold text-xl leading-tight">Prepare Your Board Application</h3>
                            <p className="text-primary-foreground/80 text-sm">Make sure your board biography and value proposition are up to date before applying.</p>
                            <Button variant="secondary" asChild className="w-full font-bold">
                                <Link href="/profile/professional">Edit My Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
