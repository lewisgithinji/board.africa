import { createClient, getUser, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { EngagementChart } from '@/components/dashboard/analytics/EngagementChartLazy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Users, Calendar, TrendingUp, ArrowRight, Activity, Clock, FileText } from 'lucide-react';
import { StatsPulse } from '@/components/dashboard/analytics/StatsPulse';
import { QuickActionsGrid } from '@/components/dashboard/home/QuickActionsGrid';
import { UpcomingEvents } from '@/components/dashboard/home/UpcomingEvents';


export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null; // Auth gated by (dashboard)/layout.tsx

  const profile = await getProfile(user.id);
  if (!profile) return null; // Onboarding guard in layout ensures this exists

  const supabase = await createClient();

  const [organizationResult, memberCountResult, upcomingMeetingsResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, slug, company_name, description, logo_url, is_public')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('board_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.id),

    supabase
      .from('meetings')
      .select('id, title, meeting_date, location')
      .eq('organization_id', user.id)
      .eq('status', 'upcoming')
      .order('meeting_date', { ascending: true })
      .limit(5),
  ]);

  const organization = organizationResult.data;
  const memberCount = memberCountResult.count || 0;
  const upcomingMeetings = upcomingMeetingsResult.data || [];
  const upcomingCount = upcomingMeetings.length;
  const hasOrganization = !!organization;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile.role === 'organization'
              ? 'Here is your governance overview for today.'
              : 'Track your board positions and opportunities.'}
          </p>
        </div>
        <div className="hidden sm:block">
          <Badge variant="outline" className="px-3 py-1 text-sm bg-white dark:bg-slate-800">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Premium Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsPulse
          title="Total Members"
          value={memberCount}
          icon={Users}
          colorClass="text-violet-600 bg-violet-50"
          trend={{ value: 12, direction: 'up', label: 'vs last month' }}
          delay={0}
        />
        <StatsPulse
          title="Board Meetings"
          value={upcomingCount}
          icon={Calendar}
          colorClass="text-blue-600 bg-blue-50"
          delay={100}
        />
        <StatsPulse
          title="Resolutions"
          value="3"
          icon={FileText}
          colorClass="text-emerald-600 bg-emerald-50"
          trend={{ value: 2, direction: 'up', label: 'new this week' }}
          delay={200}
        />
        <StatsPulse
          title="Governance Score"
          value="85%"
          icon={Activity}
          colorClass="text-amber-600 bg-amber-50"
          trend={{ value: 5, direction: 'up', label: 'vs last quarter' }}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Main) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engagement Chart */}
          <EngagementChart />

          {/* Recent Activity */}
          <Card className="border-none shadow-lg shadow-indigo-500/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Placeholder activity items */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex relative items-start gap-4 pb-1">
                    <div className="absolute left-0 top-10 bottom-0 w-px bg-indigo-50 h-full" />
                    <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                      <Clock className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">New document uploaded: Q4 Financial Report</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • by {profile.full_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (secondary) */}
        <div className="space-y-6">
          <QuickActionsGrid />

          <div className="h-[400px]">
            <UpcomingEvents meetings={upcomingMeetings} />
          </div>

          {hasOrganization && (
            <Card className="border-none shadow-lg shadow-indigo-500/5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative">
              {/* Decorative bg blobs */}
              <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />

              <CardHeader>
                <CardTitle className="text-base text-white/90">Organization Profile</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    <AvatarImage src={organization.logo_url || undefined} alt={organization.company_name} />
                    <AvatarFallback className="bg-white/10 text-white font-bold">
                      {organization.company_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{organization.company_name}</h3>
                    <Badge variant="outline" className="mt-1 border-white/20 text-white/80 hover:bg-white/10">
                      {organization.is_public ? 'Public Profile' : 'Private'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-indigo-100/70 line-clamp-2 mb-4">
                  {organization.description || `${organization.company_name} dashboard.`}
                </p>
                {organization.is_public && organization.slug && (
                  <Link href={`/org/${organization.slug}`} target="_blank">
                    <Button size="sm" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 border-none font-semibold">
                      View Public Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
