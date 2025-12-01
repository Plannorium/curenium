"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, ClipboardListIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
  userId: { fullName: string };
  targetType: string;
  targetId: string;
}

const formatAction = (action: string) => {
  const [target, event] = action.split('.');
  if (!target || !event) return action;

  const formattedTarget = target.charAt(0).toUpperCase() + target.slice(1);
  
  let formattedEvent = event;
  if (!event.endsWith('ed')) {
      if (event.endsWith('e')) {
          formattedEvent += 'd';
      } else {
          formattedEvent += 'ed';
      }
  }

  return `${formattedTarget} ${formattedEvent.charAt(0).toUpperCase() + formattedEvent.slice(1)}`;
};

const AuditLogPage = () => {
  const { language } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(() => {
    return (key: string) => {
      const keys = key.split('.');
      let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }, [language]);


  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await fetch(`/api/audit-logs`);
        if (!res.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const data: AuditLog[] = await res.json();
        setAuditLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader className="relative">
            <CardTitle className="flex items-center text-lg font-semibold text-foreground dark:text-white">
              <div className={`p-2 bg-blue-500/10 rounded-lg mr-3 border border-blue-500/20 ${language === "ar" ? "ml-3" : ""}`}>
                <ClipboardListIcon className="h-5 w-5 text-blue-500" />
              </div>
              {t('auditLogs.globalAuditLogs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="backdrop-blur-lg bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-purple-500/5 dark:to-purple-500/10 rounded-xl pointer-events-none"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center text-lg font-semibold text-foreground dark:text-white">
            <div className={`p-2 bg-blue-500/10 rounded-lg mr-3 border border-blue-500/20 ${language === "ar" ? "ml-3" : ""}`}>
              <ClipboardListIcon className="h-5 w-5 text-blue-500" />
            </div>
            {t('auditLogs.globalAuditLogs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {auditLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auditLogs.date')}</TableHead>
                  <TableHead>{t('auditLogs.action')}</TableHead>
                  <TableHead>{t('auditLogs.user')}</TableHead>
                  <TableHead>{t('auditLogs.targetType')}</TableHead>
                  <TableHead>{t('auditLogs.targetId')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatAction(log.action)}</TableCell>
                    <TableCell>{log.userId?.fullName || "System"}</TableCell>
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell>{log.targetId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>{t('auditLogs.noAuditLogsFound')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;