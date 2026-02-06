import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Globe, Mail, MapPin, Phone, Users } from 'lucide-react';
import type { Metadata } from 'next';

type PageProps = {
    params: Promise<{ slug: string }>;
};

const positionLabels: Record<string, string> = {
    chairman: 'Chairman',
    vice_chairman: 'Vice Chairman',
    ceo: 'CEO',
    cfo: 'CFO',
    director: 'Director',
    independent_director: 'Independent Director',
    executive_director: 'Executive Director',
    non_executive_director: 'Non-Executive Director',
    secretary: 'Secretary',
    member: 'Member',
    observer: 'Observer',
    other: 'Other',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const supabase = await createClient();

    const { data: org } = await supabase
        .from('organizations')
        .select('company_name, tagline, description')
        .eq('slug', resolvedParams.slug)
        .eq('is_public', true)
        .single();

    if (!org) {
        return { title: 'Organization Not Found' };
    }

    return {
        title: `${org.company_name} | Board.Africa`,
        description: org.tagline || org.description || `${org.company_name} on Board.Africa`,
    };
}

export default async function OrganizationPublicPage({ params }: PageProps) {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Fetch organization
    const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('is_public', true)
        .single();

    if (error || !org) {
        notFound();
    }

    // Fetch public board members
    const { data: members } = await supabase
        .from('board_members')
        .select('*')
        .eq('organization_id', org.id)
        .eq('status', 'active')
        .eq('show_on_public_profile', true)
        .order('display_order', { ascending: true });

    const activeMembers = members || [];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="border-b">
                <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row gap- items-start md:items-center">
                        {org.logo_url && (
                            <Avatar className="h-24 w-24 rounded-lg">
                                <AvatarImage src={org.logo_url} alt={org.company_name} />
                                <AvatarFallback className="rounded-lg text-2xl">
                                    {org.company_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">{org.company_name}</h1>
                            {org.tagline && (
                                <p className="text-xl text-muted-foreground mt-2">{org.tagline}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* About */}
                        {org.description && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">About</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">{org.description}</p>
                            </div>
                        )}

                        {/* Board Members */}
                        {activeMembers.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Board Members</h2>
                                    <Badge variant="secondary">
                                        <Users className="h-3 w-3 mr-1" />
                                        {activeMembers.length} Members
                                    </Badge>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {activeMembers.map((member) => {
                                        const initials = member.full_name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2);

                                        const position = member.position === 'other' && member.custom_position
                                            ? member.custom_position
                                            : positionLabels[member.position];

                                        return (
                                            <Card key={member.id}>
                                                <CardHeader>
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg">{member.full_name}</CardTitle>
                                                            <CardDescription>{position}</CardDescription>
                                                            {member.is_independent && (
                                                                <Badge variant="outline" className="mt-2 text-xs">
                                                                    Independent Director
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                {member.bio && (
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {org.industry && (
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Industry</p>
                                            <p className="text-sm text-muted-foreground">{org.industry}</p>
                                        </div>
                                    </div>
                                )}

                                {org.country && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{org.country}</p>
                                        </div>
                                    </div>
                                )}

                                {org.year_founded && (
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Founded</p>
                                            <p className="text-sm text-muted-foreground">{org.year_founded}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {org.website && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">Website</p>
                                            <a
                                                href={org.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline truncate block"
                                            >
                                                {org.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {org.contact_email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">Email</p>
                                            <a
                                                href={`mailto:${org.contact_email}`}
                                                className="text-sm text-primary hover:underline truncate block"
                                            >
                                                {org.contact_email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {org.contact_phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{org.contact_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
