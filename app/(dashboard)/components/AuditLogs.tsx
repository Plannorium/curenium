import React from 'react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

const AuditLogs = () => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { data: auditLogs, error } = useSWR(
    session?.user?.organizationId ? '/api/audit-logs' : null,
    fetcher
  );

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  if (error) return null;
  if (!auditLogs) return <Loader variant="minimal" />;

  const recentLogs = auditLogs.slice(0, 4); // Show only recent 5

  return (
    <div className="space-y-4">
      {recentLogs.map((log: any, index: number) => (
        <div key={log._id || index} className="p-3 bg-background/20 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors duration-200">
          <h4 className="text-sm font-medium text-foreground dark:text-white truncate">
            {log.action.replace('.', ' ').toUpperCase()}
          </h4>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            {log.userId?.fullName || 'System'} • {formatDistanceToNow(new Date(log.createdAt))} ago
          </p>
        </div>
      ))}
       <Link href="/dashboard/ehr/audit-logs" passHref>
        <Button variant="outline" size="sm" className="w-full group cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:border-primary/50">
          {t('auditLogs.viewAll')}
          <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'mr-2' : 'ml-2'} transform transition-transform duration-300 group-hover:translate-x-1`} />
        </Button>
      </Link>
    </div>
  );
};

export default AuditLogs;