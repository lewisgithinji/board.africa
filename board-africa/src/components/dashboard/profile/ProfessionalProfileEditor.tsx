'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProfessionalProfile, Experience, Skill, Certification } from '@/lib/types/database.types';
import { UserCircle, Briefcase, Award, Palette, Settings as SettingsIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BasicInfoForm } from './BasicInfoForm';
import { ExperienceDialog } from './ExperienceDialog';
import { SkillDialog } from './SkillDialog';
import { CertificationDialog } from './CertificationDialog';
import { calculateBoardReadinessScore } from '@/lib/score-engine';

interface ProfessionalProfileEditorProps {
    initialProfile: Partial<ProfessionalProfile>;
    initialExperiences: Experience[];
    initialSkills: Skill[];
    initialCertifications: Certification[];
}

export function ProfessionalProfileEditor({
    initialProfile,
    initialExperiences,
    initialSkills,
    initialCertifications,
}: ProfessionalProfileEditorProps) {
    const [activeTab, setActiveTab] = useState('basic');
    const router = useRouter();

    useEffect(() => {
        if (initialProfile.id) return; // Row already exists
        (async () => {
            const supabase = (await import('@/lib/supabase/client')).createClient();
            await supabase.from('professional_profiles').insert(
                { profile_id: initialProfile.profile_id! }
            );
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const score = calculateBoardReadinessScore(
        initialProfile,
        initialExperiences,
        initialSkills,
        initialCertifications
    );

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Overview */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2 ring-4 ring-primary/5">
                            <UserCircle className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{initialProfile.headline || 'Your Headline'}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1 mt-1">
                            Readiness Score: <Badge variant="default" className="bg-primary hover:bg-primary">{score}%</Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Marketplace Visibility</span>
                            <Badge variant={initialProfile.is_marketplace_visible ? "default" : "secondary"}>
                                {initialProfile.is_marketplace_visible ? 'Visible' : 'Hidden'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className="capitalize">
                                {initialProfile.availability_status || 'Open'}
                            </Badge>
                        </div>
                        <Button variant="outline" className="w-full gap-2 border-primary/20 hover:border-primary/50 transition-all font-semibold" size="sm" asChild>
                            <Link href={`/marketplace/talents/${initialProfile.profile_id}`}>
                                <Eye className="h-4 w-4" />
                                Preview Public Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-primary/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">Profile Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                        <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000"
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center font-medium">Your profile is {score}% ready for board opportunities</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Content */}
            <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 w-full bg-muted/30 p-1 mb-8 border border-muted-foreground/10 rounded-xl overflow-hidden shadow-sm">
                        <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2">
                            <UserCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Basic</span>
                        </TabsTrigger>
                        <TabsTrigger value="experience" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="hidden sm:inline">Experience</span>
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2">
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Skills</span>
                        </TabsTrigger>
                        <TabsTrigger value="certifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2">
                            <Award className="h-4 w-4" />
                            <span className="hidden sm:inline">Certs</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2">
                            <SettingsIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Market</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 animate-in fade-in-50 duration-500">
                        <Card className="border-primary/5 shadow-md">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-lg">Professional Biography</CardTitle>
                                <CardDescription>Tell organizations about your professional journey and board value proposition.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <BasicInfoForm profile={initialProfile} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-4 animate-in fade-in-50 duration-500">
                        <Card className="border-primary/5 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/10">
                                <div>
                                    <CardTitle className="text-lg">Career History</CardTitle>
                                    <CardDescription>Include both executive roles and current/past board positions.</CardDescription>
                                </div>
                                <ExperienceDialog profileId={initialProfile.profile_id!} onSuccess={handleRefresh} />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-5">
                                    {initialExperiences.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl border-muted/50">
                                            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-sm">Your career history is empty.</p>
                                            <p className="text-xs opacity-70">Add your first role to begin building your board bio.</p>
                                        </div>
                                    ) : (
                                        initialExperiences.map((exp) => (
                                            <div key={exp.id} className="flex justify-between items-start group hover:bg-muted/30 p-4 rounded-xl transition-all border border-transparent hover:border-primary/10">
                                                <div className="flex gap-4">
                                                    <div className="bg-primary/5 p-2 rounded-lg h-fit group-hover:bg-primary/10 transition-colors">
                                                        <Briefcase className="h-5 w-5 text-primary/70" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-base">{exp.title}</h4>
                                                        <p className="text-sm font-medium text-muted-foreground">{exp.company_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] capitalize font-semibold shadow-sm">
                                                                {exp.experience_type}
                                                            </Badge>
                                                            <span className="text-[11px] text-muted-foreground/80 font-medium">
                                                                {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ExperienceDialog profileId={initialProfile.profile_id!} experience={exp} onSuccess={handleRefresh} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4 animate-in fade-in-50 duration-500">
                        <Card className="border-primary/5 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/10">
                                <div>
                                    <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                                    <CardDescription>Highlight your areas of governance and functional expertise.</CardDescription>
                                </div>
                                <SkillDialog profileId={initialProfile.profile_id!} onSuccess={handleRefresh} />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-3">
                                    {initialSkills.length === 0 ? (
                                        <div className="text-center py-10 w-full text-muted-foreground border-2 border-dashed rounded-xl border-muted/50">
                                            <Palette className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-medium">No skills showcased yet.</p>
                                        </div>
                                    ) : (
                                        initialSkills.map((skill) => (
                                            <Badge key={skill.id} variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors shadow-sm">
                                                {skill.name} {skill.category && <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] uppercase tracking-wider font-bold opacity-70">{skill.category}</span>}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="certifications" className="space-y-4 animate-in fade-in-50 duration-500">
                        <Card className="border-primary/5 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/10">
                                <div>
                                    <CardTitle className="text-lg">Governance Certifications</CardTitle>
                                    <CardDescription>Formal training in board governance and leadership.</CardDescription>
                                </div>
                                <CertificationDialog profileId={initialProfile.profile_id!} onSuccess={handleRefresh} />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {initialCertifications.length === 0 ? (
                                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl border-muted/50">
                                            <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-sm">No certifications listed.</p>
                                        </div>
                                    ) : (
                                        initialCertifications.map((cert) => (
                                            <div key={cert.id} className="flex justify-between items-start p-4 rounded-xl border bg-muted/5 hover:bg-muted/10 transition-all">
                                                <div>
                                                    <h4 className="font-bold text-base leading-tight">{cert.name}</h4>
                                                    <p className="text-sm text-muted-foreground font-medium mt-1">{cert.issuing_organization}</p>
                                                    {cert.issue_date && (
                                                        <p className="text-[11px] text-muted-foreground/70 mt-2 font-semibold">
                                                            Issued: {new Date(cert.issue_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <CertificationDialog profileId={initialProfile.profile_id!} certification={cert} onSuccess={handleRefresh} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 animate-in fade-in-50 duration-500">
                        <Card className="border-primary/5 shadow-md">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-lg">Marketplace visibility</CardTitle>
                                <CardDescription>Control how you appear to organizations looking for board members.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/5">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold">Show Profile in Marketplace</Label>
                                        <p className="text-xs text-muted-foreground">Allow organizations to find and invite you to board positions.</p>
                                    </div>
                                    <Switch
                                        checked={initialProfile.is_marketplace_visible}
                                        onCheckedChange={async (checked) => {
                                            const supabase = (await import('@/lib/supabase/client')).createClient();
                                            const { error } = await supabase
                                                .from('professional_profiles')
                                                .update({ is_marketplace_visible: checked })
                                                .eq('profile_id', initialProfile.profile_id);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success(checked ? 'Profile is now visible' : 'Profile is now hidden');
                                                handleRefresh();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/5">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold">Open to Mobility</Label>
                                        <p className="text-xs text-muted-foreground">Indicate if you are willing to travel or relocate for board roles.</p>
                                    </div>
                                    <Switch
                                        checked={initialProfile.mobility_preference}
                                        onCheckedChange={async (checked) => {
                                            const supabase = (await import('@/lib/supabase/client')).createClient();
                                            const { error } = await supabase
                                                .from('professional_profiles')
                                                .update({ mobility_preference: checked })
                                                .eq('profile_id', initialProfile.profile_id);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success('Mobility preference updated');
                                                handleRefresh();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-3 p-4 rounded-xl border bg-muted/5">
                                    <Label className="text-base font-semibold">Availability Status</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {['looking', 'open', 'busy', 'unavailable'].map((status) => (
                                            <Button
                                                key={status}
                                                variant={initialProfile.availability_status === status ? "default" : "outline"}
                                                className="capitalize text-xs font-semibold"
                                                size="sm"
                                                onClick={async () => {
                                                    const supabase = (await import('@/lib/supabase/client')).createClient();
                                                    const { error } = await supabase
                                                        .from('professional_profiles')
                                                        .update({ availability_status: status as any })
                                                        .eq('profile_id', initialProfile.profile_id);
                                                    if (error) toast.error(error.message);
                                                    else {
                                                        toast.success(`Availability set to ${status}`);
                                                        handleRefresh();
                                                    }
                                                }}
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
