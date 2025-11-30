"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Beaker, Calendar, FileText, CheckCircle, ArrowRight, Activity, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { ILabResult } from "@/models/LabResult";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface LabResultsDisplayProps {
  patientId: string;
}

const LabResultsDisplay = ({ patientId }: LabResultsDisplayProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [latestLabResult, setLatestLabResult] = useState<ILabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/lab-results?limit=1`);
        if (!res.ok) {
          throw new Error("Failed to fetch lab results");
        }
        const data: ILabResult[] = await res.json();
        setLatestLabResult(data.length > 0 ? data[0] : null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [patientId]);

  const isValueNormal = (value: string, referenceRange: string) => {
    if (!referenceRange) return "unknown";
    // Simple parsing for ranges like "70-100" or "< 100"
    const rangeMatch = referenceRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      const val = parseFloat(value);
      return val >= min && val <= max ? "normal" : "abnormal";
    }
    // Handle "< X" or "> X" cases
    const lessThanMatch = referenceRange.match(/<\s*(\d+(?:\.\d+)?)/);
    if (lessThanMatch) {
      const max = parseFloat(lessThanMatch[1]);
      const val = parseFloat(value);
      return val < max ? "normal" : "abnormal";
    }
    const greaterThanMatch = referenceRange.match(/>\s*(\d+(?:\.\d+)?)/);
    if (greaterThanMatch) {
      const min = parseFloat(greaterThanMatch[1]);
      const val = parseFloat(value);
      return val > min ? "normal" : "abnormal";
    }
    return "unknown";
  };

  const getResultBadgeVariant = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "abnormal":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "abnormal":
        return <ServerCrash className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Beaker className="mr-3 h-6 w-6 text-primary" />
            {t('labResults.title')}
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
        <AlertTitle>{t('labResults.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Beaker className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">{t('labResults.title')}</span>
        </CardTitle>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/dashboard/ehr/patients/${patientId}/lab-results`}>
            <span className="text-sm sm:text-base">{t('labResults.viewAllResults')}</span>
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {latestLabResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Result Status Overview */}
            <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Beaker className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {latestLabResult.testName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Latest test result
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getResultIcon(isValueNormal(latestLabResult.value, latestLabResult.referenceRange || ""))}
                <Badge className={`text-sm font-medium ${getResultBadgeVariant(isValueNormal(latestLabResult.value, latestLabResult.referenceRange || ""))}`}>
                  {t(`labResults.status.${isValueNormal(latestLabResult.value, latestLabResult.referenceRange || "")}`)}
                </Badge>
              </div>
            </div>

            {/* Detailed Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t('labResults.result')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestLabResult.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {latestLabResult.units}
                  </span>
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t('labResults.collected')}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(latestLabResult.collectedDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestLabResult.collectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {latestLabResult.referenceRange && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{t('labResults.reference')}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {latestLabResult.referenceRange}
                  </p>
                </div>
              )}

              {latestLabResult.reportedDate && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{t('labResults.reported')}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(latestLabResult.reportedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {latestLabResult.notes && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t('labResults.notes')}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{latestLabResult.notes}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Beaker className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('labResults.noLabResultsYet')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              {t('labResults.labResultsDescription')}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/ehr/patients/${patientId}/lab-results`}>
                <span className="text-sm sm:text-base">{t('labResults.viewAllResults')}</span>
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabResultsDisplay;