import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Briefcase, Award, Palette, MapPin, Globe, Mail, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function TalentProfilePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch profile and professional profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, professional_profiles(*)')
        .eq('id', id)
        .single();

    if (!profile) {
        notFound();
    }

    // If no professional profile exists, show a placeholder instead of 404
    if (!profile.professional_profiles?.[0]) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
                <Link href="/marketplace" className="mx-auto flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group w-fit mb-8">
                    <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Marketplace
                </Link>
                <div className="bg-muted/10 p-10 rounded-full w-fit mx-auto">
                    <UserCircle className="h-20 w-20 text-muted-foreground/30" />
                </div>
                <h1 className="text-2xl font-bold">Profile Unavailable</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    This user has not set up their professional profile yet. Please check back later or contact them directly if you have their details.
                </p>
            </div>
        );
    }

    const profProfile = profile.professional_profiles[0];

    // Fetch related records
    const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', id)
        .order('start_date', { ascending: false });

    const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', id);

    const { data: certifications } = await supabase
        .from('certifications')
        .select('*')
        .eq('profile_id', id);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <Link href="/marketplace" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group w-fit">
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Marketplace
            </Link>

            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden border bg-card shadow-xl">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20" />
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 flex flex-col md:flex-row items-end gap-6 mb-6">
                        <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="text-2xl font-bold">{profile.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 mb-2">
                            <h1 className="text-3xl font-black tracking-tight">{profile.full_name}</h1>
                            <p className="text-lg text-primary font-bold">{profProfile.headline}</p>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium mt-2">
                                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary/60" /> {profile.location || 'Nairobi, Kenya'}</span>
                                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary/60" /> {profProfile.availability_status}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <span className="text-3xl font-black text-primary">{profProfile.board_readiness_score}%</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Readiness Score</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t">
                        <div className="md:col-span-2 space-y-6">
                            <section className="space-y-3">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-primary" />
                                    Board Biography
                                </h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {profProfile.summary || 'No biography provided.'}
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Career History
                                </h3>
                                <div className="space-y-6">
                                    {experiences?.map((exp) => (
                                        <div key={exp.id} className="relative pl-8 border-l-2 border-primary/10 pb-2 last:pb-0">
                                            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-lg leading-tight">{exp.title}</h4>
                                                <p className="text-primary/80 font-bold">{exp.company_name}</p>
                                                <p className="text-xs text-muted-foreground font-semibold">
                                                    {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'N/A'}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-primary" />
                                    Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills?.map((skill) => (
                                        <Badge key={skill.id} variant="secondary" className="px-3 py-1 font-bold bg-primary/5 text-primary border-primary/10">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Certifications
                                </h3>
                                <div className="space-y-3">
                                    {certifications?.map((cert) => (
                                        <div key={cert.id} className="p-3 rounded-xl border bg-muted/5">
                                            <p className="font-bold text-sm leading-tight">{cert.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{cert.issuing_organization}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
