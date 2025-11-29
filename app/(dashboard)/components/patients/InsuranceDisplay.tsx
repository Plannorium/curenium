"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Insurance } from "@/types/insurance";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ServerCrash,
  ShieldCheck,
  FileText,
  Users,
  User,
  Calendar,
  Heart,
} from "lucide-react";
import DetailItem from "@/app/(dashboard)/components/patients/DetailItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface InsuranceDisplayProps {
  patientId: string;
}

const InsuranceDisplay = ({ patientId }: InsuranceDisplayProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/insurance`);
        if (!res.ok) {
          throw new Error("Failed to fetch insurance details");
        }
        const data: Insurance[] = await res.json();
        setInsurance(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, [patientId]);

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
            {t('insuranceDisplay.title')}
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
        <AlertTitle>{t('insuranceDisplay.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <ShieldCheck className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">{t('insuranceDisplay.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insurance.length > 0 ? (
          insurance.map((ins, index) => (
            <div key={ins._id} className="bg-white/80 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem icon={ShieldCheck} label={t('insuranceDisplay.provider')} value={ins.provider} />
                <DetailItem icon={FileText} label={t('insuranceDisplay.policyNumber')} value={ins.policyNumber} />
                {ins.groupNumber && <DetailItem icon={Users} label={t('insuranceDisplay.groupNumber')} value={ins.groupNumber} />}
                <DetailItem icon={User} label={t('insuranceDisplay.subscriber')} value={ins.subscriberName} />
                <DetailItem icon={Calendar} label={t('insuranceDisplay.subscriberDob')} value={new Date(ins.subscriberDob).toLocaleDateString()} />
                <DetailItem icon={Heart} label={t('insuranceDisplay.relationship')} value={ins.relationshipToPatient} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <ShieldCheck className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('insuranceDisplay.noInsuranceInformation')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              {t('insuranceDisplay.insuranceDetailsDescription')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsuranceDisplay;
