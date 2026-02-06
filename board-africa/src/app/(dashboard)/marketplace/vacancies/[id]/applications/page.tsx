import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Mail, FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SmartMatchAssistant } from '@/components/marketplace/SmartMatchAssistant';

export default async function VacancyApplicationsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: position } = await supabase
        .from('board_positions')
        .select('*')
        .eq('id', id)
        .single();

    if (!position) notFound();

    // Fetch applications with profiles
    const { data: applications } = await supabase
        .from('applications')
        .select(`
      *,
      profiles:profile_id (
        full_name,
        avatar_url,
        professional_profiles (
          headline,
          board_readiness_score
        )
      )
    `)
        .eq('position_id', id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <Link href="/marketplace/vacancies" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group">
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Vacancies
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                    <p className="text-muted-foreground">
                        Review candidates for: <span className="font-bold text-foreground">{position.title}</span>
                    </p>
                </div>
                <Badge variant="outline" className="px-4 py-1 text-sm font-semibold">
                    {applications?.length || 0} Total Applicants
                </Badge>
            </div>

            <SmartMatchAssistant
                positionId={id}
                positionTitle={position.title}
            />

            <div className="pt-4">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Received Applications
                    <Badge variant="secondary" className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-[10px]">
                        {applications?.length || 0}
                    </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {!applications || applications.length === 0 ? (
                        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
                            <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground font-medium">No applications received yet.</p>
                        </div>
                    ) : (
                        applications.map((app: any) => (
                            <Card key={app.id} className="group hover:border-primary/20 transition-all overflow-hidden border-primary/5">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Applicant Info Sidebar */}
                                        <div className="w-full md:w-72 bg-muted/5 p-6 border-b md:border-b-0 md:border-r space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                    <AvatarImage src={app.profiles?.avatar_url} />
                                                    <AvatarFallback>{app.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold">{app.profiles?.full_name}</h4>
                                                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                                                        Score: {app.profiles?.professional_profiles?.[0]?.board_readiness_score || 0}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                "{app.profiles?.professional_profiles?.[0]?.headline || 'Professional Profile'}"
                                            </p>
                                            <div className="pt-2">
                                                <Button variant="outline" size="sm" className="w-full font-bold gap-2 text-xs" asChild>
                                                    <Link href={`/marketplace/talents/${app.profile_id}`}>
                                                        View Profile
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Application Details */}
                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="capitalize font-bold border-primary/20 text-primary">
                                                        {app.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                        <Calendar className="h-3 w-3" />
                                                        Applied {new Date(app.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" className="font-bold text-xs h-8">Shortlist</Button>
                                                    <Button variant="ghost" size="sm" className="font-bold text-xs h-8 text-destructive hover:bg-destructive/5 hover:text-destructive">Reject</Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <FileText className="h-3 w-3" />
                                                    Cover Letter Preview
                                                </h5>
                                                <p className="text-sm text-muted-foreground/90 whitespace-pre-wrap line-clamp-4 leading-relaxed bg-muted/5 p-4 rounded-xl border italic">
                                                    {app.cover_letter || 'No cover letter provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
