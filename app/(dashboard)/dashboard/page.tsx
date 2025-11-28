"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, CalendarIcon, BrainIcon, ClipboardListIcon, Users, Activity, Sparkles } from 'lucide-react';
import Announcements from '@/app/(dashboard)/components/Announcements';
import AuditLogs from '@/app/(dashboard)/components/AuditLogs';
import ShiftView from '@/app/(dashboard)/components/ShiftView';
import { InviteList } from '@/components/invites/InviteList';
import useSWR from 'swr';
import { translations } from '@/lib/translations';
import { Loader } from '@/components/ui/Loader';

interface Organization {
  name: string;
  language: keyof typeof translations;
}

interface Shift {
  _id: string;
  startTime: string;
  endTime: string;
  user: {
    fullName: string;
  };
}

interface Alert {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
}

interface Appointment {
  _id: string;
  status: string;
  date: string;
}

interface User {
  _id: string;
  online: boolean;
}

const fetcher = (url: string): Promise<any> => fetch(url).then(res => res.json());

const DashboardContent: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState('');

  // First fetch user profile to get organizationId
  const { data: userProfile, error: profileError } = useSWR(
    (status === 'authenticated' && session?.user?.id) ? ['/api/profile', pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );

  const orgId = userProfile?.organizationId;

  const { data: organization, error: orgError } = useSWR<Organization>(
    (status === 'authenticated' && orgId) ? [`/api/organization?id=${orgId}`, pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );
  const { data: shifts, error: shiftsError } = useSWR<Shift[]>(
    (status === 'authenticated' && orgId) ? ['/api/shifts', pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );
  const { data: alerts, error: alertsError } = useSWR<Alert[]>(
    (status === 'authenticated' && orgId) ? ['/api/alerts', pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );
  const { data: appointments, error: appointmentsError } = useSWR<Appointment[]>(
    (status === 'authenticated' && orgId) ? ['/api/appointments', pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );
  const { data: users, error: usersError } = useSWR<User[]>(
    (status === 'authenticated' && orgId) ? ['/api/users', pathname] : null,
    ([url]) => fetcher(url),
    { revalidateOnMount: true, dedupingInterval: 0 }
  );

  useEffect(() => {
    setCurrentDate(format(new Date(), 'eeee, MMMM d'));
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const welcomeMessage = organization?.language ? translations[organization.language as keyof typeof translations]?.welcome || translations.en.welcome : translations.en.welcome;

  const isAdmin = session?.user?.role === 'admin';

  // Filter shifts based on user role
  const userShifts = isAdmin ? shifts : shifts?.filter(shift => shift.user?.fullName === session?.user?.name);

  const currentShift = userShifts?.find(shift => new Date(shift.startTime) <= new Date() && new Date(shift.endTime) >= new Date());
  const upcomingShift = userShifts?.find(shift => new Date(shift.startTime) > new Date());

  // Get all current shifts for display (for admin)
  const allCurrentShifts = shifts?.filter(shift => new Date(shift.startTime) <= new Date() && new Date(shift.endTime) >= new Date()) || [];
  const allUpcomingShifts = shifts?.filter(shift => new Date(shift.startTime) > new Date()) || [];

  const criticalAlerts = alerts?.filter(alert => alert.level === 'critical').length || 0;
  const urgentAlerts = alerts?.filter(alert => alert.level === 'urgent').length || 0;

  const pendingAppointments = appointments?.filter(appointment => appointment.status === 'upcoming').length || 0;
  const overdueAppointments = appointments?.filter(appointment => new Date(appointment.date) < new Date() && appointment.status !== 'completed').length || 0;

  const activeStaff = users?.filter(user => user.online).length || 0;
  const totalStaff = users?.length || 0;

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="relative bg-background h-[calc(100vh-10rem)] lg:h-full overflow-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black pointer-events-none hidden dark:block"></div>
        <div className="relative h-screen p-4 sm:p-6 md:p-8 rounded-xs md:rounded-lg flex items-center justify-center">
          <Loader variant="fullscreen" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-background h-[calc(100vh-10rem)] lg:h-full overflow-auto`}>
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black pointer-events-none hidden dark:block"></div>

        <div className="relative h-screen p-4 sm:p-6 md:p-8 rounded-xs md:rounded-lg">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm bg-card/30 dark:bg-gray-900/70 rounded-2xl p-6 border border-border/50 dark:border-gray-700/50 shadow-lg">
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground dark:text-white mb-1">
                <span className="block sm:inline bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{welcomeMessage}, </span>
                <span className="block sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{session?.user?.name || session?.user?.email || 'User'}</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground dark:text-gray-400 font-medium">
                {currentDate} • <span className="text-primary font-semibold capitalize">{organization?.name || 'Organization'}</span>
              </p>
            </div>
            <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white dark:text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-primary/20">
              <BrainIcon className="mr-2 h-4 w-4" />
              <Sparkles className="mr-1 h-3 w-3" />
              Ask AI Assistant
            </Button>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Current Shift Card */}
            <Card className="group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-primary/80 to-primary/60 dark:from-primary/90 dark:to-primary border-primary/30 text-white dark:text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-200 dark:text-primary-foreground/90">
                  {currentShift ? 'Current Shift' : 'Upcoming Shift'}
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CalendarIcon className="h-4 w-4 text-white dark:text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                {currentShift ? (
                  <>
                    <div className="text-2xl md:text-3xl font-bold text-white dark:text-primary-foreground mb-1">
                      {format(new Date(currentShift.startTime), 'HH:mm')} - {format(new Date(currentShift.endTime), 'HH:mm')}
                    </div>
                    <p className="text-sm text-gray-300 dark:text-primary-foreground/80 font-medium">
                      {formatDistanceToNow(new Date(currentShift.endTime))} remaining
                    </p>
                    {isAdmin && allCurrentShifts.length > 1 && (
                      <p className="text-xs text-gray-400 dark:text-primary-foreground/60 mt-1">
                        {allCurrentShifts.map(s => s.user.fullName).join(', ')}
                      </p>
                    )}
                  </>
                ) : upcomingShift ? (
                  <>
                    <div className="text-2xl md:text-3xl font-bold text-white dark:text-primary-foreground mb-1">
                      {format(new Date(upcomingShift.startTime), 'HH:mm')} - {format(new Date(upcomingShift.endTime), 'HH:mm')}
                    </div>
                    <p className="text-sm text-gray-300 dark:text-primary-foreground/80 font-medium">
                      Starts in {formatDistanceToNow(new Date(upcomingShift.startTime))}
                    </p>
                    {isAdmin && allUpcomingShifts.length > 1 && (
                      <p className="text-xs text-gray-400 dark:text-primary-foreground/60 mt-1">
                        {allUpcomingShifts.map(s => s.user.fullName).join(', ')}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-lg font-semibold text-white dark:text-primary-foreground">
                    {isAdmin && allCurrentShifts.length > 0 ? (
                      <>
                        No personal shifts
                        <p className="text-xs text-gray-400 dark:text-primary-foreground/60 mt-1">
                          {allCurrentShifts.length} active: {allCurrentShifts.map(s => s.user.fullName).join(', ')}
                        </p>
                      </>
                    ) : (
                      'No upcoming shifts'
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Alerts Card */}
            <Card className="group relative overflow-hidden backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 dark:from-red-500/10 to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Active Alerts</CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg backdrop-blur-sm border border-red-500/20">
                  <BellIcon className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl md:text-3xl font-bold text-red-500 mb-1">{criticalAlerts} Critical</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">+{urgentAlerts} Urgent</p>
              </CardContent>
            </Card>

            {/* Pending Tasks Card */}
            <Card className="group relative overflow-hidden backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 dark:from-amber-500/10 to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Pending Appointments</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg backdrop-blur-sm border border-amber-500/20">
                  <ClipboardListIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-1">{pendingAppointments}</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">
                  <span className="text-amber-600 dark:text-amber-500 font-semibold">{overdueAppointments} Overdue</span>
                </p>
              </CardContent>
            </Card>

            {/* Active Staff Card */}
            <Card className="group relative overflow-hidden backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 dark:from-green-500/10 to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Active Staff</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg backdrop-blur-sm border border-green-500/20">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-1">{activeStaff} / {totalStaff}</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">Cardiology Department</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ShiftView limit={5} />
            </div>
            <div className="pb-6 lg:pb-4">
              {/* <Card className="backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 dark:from-primary/10 via-transparent to-accent/5 dark:to-accent/10 rounded-xl pointer-events-none"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg font-semibold text-foreground dark:text-white">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3 border border-primary/20">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    Department Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <Announcements />
                </CardContent>
              </Card> */}
              <Card className="backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-purple-500/5 dark:to-purple-500/10 rounded-xl pointer-events-none"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg font-semibold text-foreground dark:text-white">
                    <div className="p-2 bg-blue-500/10 rounded-lg mr-3 border border-blue-500/20">
                      <ClipboardListIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    Recent Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <AuditLogs />
                </CardContent>
              </Card>
              {/* <InviteList /> */}
            </div>
          </div>
        </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
   <Suspense fallback={<Loader variant="fullscreen" text="Loading Dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;