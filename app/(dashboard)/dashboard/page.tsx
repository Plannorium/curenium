"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, CalendarIcon, BrainIcon, ClipboardListIcon, Users, Activity, Sparkles } from 'lucide-react';
import Announcements from '@/app/(dashboard)/components/Announcements';
import ShiftView from '@/app/(dashboard)/components/ShiftView';
import { InviteList } from '@/components/invites/InviteList';
import useSWR from 'swr';
import { translations } from '@/lib/translations';

interface Organization {
  name: string;
  language: keyof typeof translations;
}

const fetcher = (url: string): Promise<Organization> => fetch(url).then(res => res.json());

const DashboardContent: React.FC = () => {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState('');
  const { data: organization, error: _error } = useSWR<Organization>(session?.user?.organizationId ? `/api/organization?id=${session.user.organizationId}` : null, fetcher);

  useEffect(() => {
    setCurrentDate(format(new Date(), 'eeee, MMMM d'));
  }, []);

  const welcomeMessage = organization?.language ? translations[organization.language as keyof typeof translations]?.welcome || translations.en.welcome : translations.en.welcome;

  return (
    <div className={`relative bg-background min-h-screen`}>
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black pointer-events-none hidden dark:block"></div>

        <div className="relative p-4 sm:p-6 md:p-8 rounded-xs md:rounded-lg">
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
                <CardTitle className="text-sm font-semibold text-gray-200 dark:text-primary-foreground/90">Current Shift</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CalendarIcon className="h-4 w-4 text-white dark:text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl md:text-3xl font-bold text-white dark:text-primary-foreground mb-1">08:00 - 17:00</div>
                <p className="text-sm text-gray-300 dark:text-primary-foreground/80 font-medium">4 hours remaining</p>
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
                <div className="text-2xl md:text-3xl font-bold text-red-500 mb-1">2 Critical</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">+3 Urgent</p>
              </CardContent>
            </Card>

            {/* Pending Tasks Card */}
            <Card className="group relative overflow-hidden backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 dark:from-amber-500/10 to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Pending Tasks</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg backdrop-blur-sm border border-amber-500/20">
                  <ClipboardListIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-1">5</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">
                  <span className="text-amber-600 dark:text-amber-500 font-semibold">2 Overdue</span>
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
                <div className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-1">12 / 15</div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 font-medium">Cardiology Department</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ShiftView />
            </div>
            <div className="space-y-6">
              <Card className="backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
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
              </Card>
              <InviteList />
            </div>
          </div>
        </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;