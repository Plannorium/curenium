"use client";
import { useState, useEffect } from "react";
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
import { ServerCrash } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
  userId: { fullName: string };
}

interface AuditLogDisplayProps {
  patientId: string;
}

const AuditLogDisplay = ({ patientId }: AuditLogDisplayProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const response = await fetch(`/api/audit-logs?patientId=${patientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const data: AuditLog[] = await response.json();
        setAuditLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLogs();
  }, [patientId]);

  const formatAction = (action: string) => {
    if (!action) return "";
    const [entity, event] = action.split('.');
    if (!entity || !event) return action;
  
    const formattedEntity = entity.charAt(0).toUpperCase() + entity.slice(1);
    let formattedEvent;
  
    switch (event) {
      case 'create':
        formattedEvent = 'Created';
        break;
      case 'update':
        formattedEvent = 'Updated';
        break;
      case 'delete':
        formattedEvent = 'Deleted';
        break;
      default:
        formattedEvent = event.charAt(0).toUpperCase() + event.slice(1);
    }
  
    return `${formattedEntity} ${formattedEvent}`;
  };

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <ServerCrash className="mr-3 h-6 w-6 text-primary" />
            {t('auditLogDisplay.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 backdrop-blur-lg">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>{t('auditLogDisplay.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <ServerCrash className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">{t('auditLogDisplay.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auditLogs.length > 0 ? (
          <div className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden bg-white/50 dark:bg-gray-900/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">{t('auditLogDisplay.date')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">{t('auditLogDisplay.action')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">{t('auditLogDisplay.user')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log, index) => (
                  <TableRow
                    key={log._id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white/30 dark:bg-gray-900/10' : 'bg-gray-50/30 dark:bg-gray-800/20'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{formatAction(log.action)}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{log.userId?.fullName || "System"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <ServerCrash className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('auditLogDisplay.noAuditLogsYet')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              {t('auditLogDisplay.auditLogsDescription')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogDisplay;