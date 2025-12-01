"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Edit,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader } from "@/components/ui/Loader";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

// Types
interface Discharge {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    mrn?: string;
    dob?: string;
    gender?: string;
  };
  admission: {
    _id: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    email: string;
  };
  matronNurse: {
    _id: string;
    fullName: string;
    email: string;
  };
  plannedDate: string;
  actualDischargeDate?: string;
  dischargeType: 'routine' | 'against_medical_advice' | 'transfer' | 'death';
  dischargeReason: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  initiatedAt: string;
  completedAt?: string;
}

const DischargesPage = () => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string, replacements?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value && replacements) {
      return Object.keys(replacements).reduce((str, key) => {
        return str.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
      }, value);
    }
    return value || key;
  };

  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDischarges();
  }, []);

  const fetchDischarges = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discharges');
      if (response.ok) {
        const data = await response.json() as Discharge[];
        setDischarges(data);
      } else {
        toast.error(t('dischargesPage.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Failed to fetch discharges:', error);
      toast.error(t('dischargesPage.errors.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDischargeTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'against_medical_advice': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'transfer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'death': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const key = `dischargesPage.status.${status}`;
    return t(key);
  };

  const getDischargeTypeLabel = (type: string) => {
    const key = `dischargesPage.dischargeTypes.${type}`;
    return t(key);
  };

  const handleDischargeAction = async (dischargeId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/discharges/${dischargeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        toast.success(t('dischargesPage.errors.actionSuccess', { action }));
        fetchDischarges();
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || t('dischargesPage.errors.actionFailed', { action }));
      }
    } catch (error) {
      console.error(`Failed to ${action} discharge:`, error);
      toast.error(t('dischargesPage.errors.actionError', { action }));
    }
  };

  const filteredDischarges = discharges.filter(discharge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return discharge.status === 'planned';
    if (activeTab === 'in_progress') return discharge.status === 'in_progress';
    return discharge.status === activeTab;
  });

  const canCompleteDischarge = (discharge: Discharge) => {
    return session?.user?.role === 'matron_nurse' &&
           discharge.status === 'in_progress' &&
           discharge.matronNurse._id === session.user.id;
  };

  const canCancelDischarge = (discharge: Discharge) => {
    return session?.user?.role === 'matron_nurse' &&
           ['planned', 'in_progress'].includes(discharge.status) &&
           discharge.matronNurse._id === session.user.id;
  };

  if (loading) {
    return <Loader text={t('dischargesPage.loading')} />;
  }

  return (
    <div className="space-y-8 p-2.5 md:p-3.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dischargesPage.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('dischargesPage.subtitle')}
          </p>
        </div>
        {session?.user?.role === 'matron_nurse' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('dischargesPage.buttons.planDischarge')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('dischargesPage.stats.planned')}</p>
                <p className="text-2xl font-bold">
                  {discharges.filter(d => d.status === 'planned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-4">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('dischargesPage.stats.inProgress')}</p>
                <p className="text-2xl font-bold">
                  {discharges.filter(d => d.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('dischargesPage.stats.completed')}</p>
                <p className="text-2xl font-bold">
                  {discharges.filter(d => d.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('dischargesPage.stats.cancelled')}</p>
                <p className="text-2xl font-bold">
                  {discharges.filter(d => d.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discharges List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dischargesPage.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t('dischargesPage.tabs.all')}</TabsTrigger>
              <TabsTrigger value="upcoming">{t('dischargesPage.tabs.planned')}</TabsTrigger>
              <TabsTrigger value="in_progress">{t('dischargesPage.tabs.inProgress')}</TabsTrigger>
              <TabsTrigger value="completed">{t('dischargesPage.tabs.completed')}</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {filteredDischarges.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('dischargesPage.emptyState.noDischarges')}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? t('dischargesPage.emptyState.noPlansYet') : t('dischargesPage.emptyState.noTabDischarges', { tab: activeTab.replace('_', ' ') })}
                  </p>
                </div>
              ) : (
                filteredDischarges.map((discharge) => (
                  <Card key={discharge._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {discharge.patient.firstName[0]}{discharge.patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {discharge.patient.firstName} {discharge.patient.lastName}
                              </h3>
                              <Badge className={getDischargeTypeColor(discharge.dischargeType)}>
                                {getDischargeTypeLabel(discharge.dischargeType)}
                              </Badge>
                              <Badge className={getStatusColor(discharge.status)}>
                                {getStatusLabel(discharge.status)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                              <div>
                                <span className="font-medium">{t('dischargesPage.labels.mrn')}</span> {discharge.patient.mrn || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">{t('dischargesPage.labels.doctor')}</span> {discharge.doctor.fullName}
                              </div>
                              <div>
                                <span className="font-medium">{t('dischargesPage.labels.matronNurse')}</span> {discharge.matronNurse.fullName}
                              </div>
                              <div>
                                <span className="font-medium">{t('dischargesPage.labels.plannedDate')}</span> {new Date(discharge.plannedDate).toLocaleDateString()}
                              </div>
                              {discharge.actualDischargeDate && (
                                <div>
                                  <span className="font-medium">{t('dischargesPage.labels.actualDate')}</span> {new Date(discharge.actualDischargeDate).toLocaleDateString()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">{t('dischargesPage.labels.initiated')}</span> {new Date(discharge.initiatedAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm">
                                <span className="font-medium">{t('dischargesPage.labels.reason')}</span> {discharge.dischargeReason}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            {t('dischargesPage.buttons.viewDetails')}
                          </Button>

                          {discharge.status === 'planned' && session?.user?.role === 'matron_nurse' && discharge.matronNurse._id === session.user.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDischargeAction(discharge._id, 'update', { status: 'in_progress' })}
                            >
                              {t('dischargesPage.buttons.startProcess')}
                            </Button>
                          )}

                          {canCompleteDischarge(discharge) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDischargeAction(discharge._id, 'complete')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t('dischargesPage.buttons.complete')}
                            </Button>
                          )}

                          {canCancelDischarge(discharge) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDischargeAction(discharge._id, 'cancel')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {t('dischargesPage.buttons.cancel')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DischargesPage;