import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CreditCard, UserCircle, Settings as SettingsIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get user profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id || '')
        .single();

    const isOrg = profile?.role === 'organization';

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and organization preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Organization Settings - Only for Org Role */}
                {isOrg && (
                    <Link href="/settings/organization" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <Building2 className="h-5 w-5" />
                                    Organization Profile
                                </CardTitle>
                                <CardDescription>
                                    Update your company details, logo, and public presence.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                )}

                {/* Billing - Coming in Phase 12 */}
                {isOrg && (
                    <Link href="/settings/billing" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <CreditCard className="h-5 w-5" />
                                    Billing & Subscription
                                </CardTitle>
                                <CardDescription>
                                    Manage your subscription plan, payment methods, and invoices.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                )}

                {/* Personal Profile */}
                <Link href="/profile/professional" className="block group">
                    <Card className="h-full hover:border-primary/50 transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <UserCircle className="h-5 w-5" />
                                My Professional Profile
                            </CardTitle>
                            <CardDescription>
                                Edit your bio, skills, and experience for the Board Marketplace.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Account Settings - General */}
                <Link href="/settings/account" className="block group opacity-50 pointer-events-none"> {/* Placeholder for future phase */}
                    <Card className="h-full hover:border-primary/50 transition-all cursor-pointer shadow-sm group-hover:shadow-md bg-muted/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Account Security
                            </CardTitle>
                            <CardDescription>
                                Password, 2FA, and notification preferences. (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
