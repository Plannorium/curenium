"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prescription } from "@/types/prescription";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Pill, Calendar, Repeat, PlusCircle, ArrowRight, User, ChevronDown, ChevronUp, Activity, Stethoscope, Syringe, Clock, Package, FileText, AlertCircle, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { AddPrescriptionModal } from "./AddPrescriptionModal";
import { AdministerPrescriptionModal } from './AdministerPrescriptionModal';
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

interface PrescriptionsDisplayProps {
  patientId: string;
}

const PrescriptionsDisplay = ({ patientId }: PrescriptionsDisplayProps) => {
  const { language } = useLanguage();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdministerModalOpen, setIsAdministerModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

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

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      const data: Prescription[] = await res.json();
      setPrescriptions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTimeline = (prescriptionId: string) => {
    setExpandedTimelines(prev => {
      const newSet = new Set(prev);
      newSet.has(prescriptionId) ? newSet.delete(prescriptionId) : newSet.add(prescriptionId);
      return newSet;
    });
  };

  const toggleDetails = (prescriptionId: string) => {
    setExpandedDetails(prev => {
      const newSet = new Set(prev);
      newSet.has(prescriptionId) ? newSet.delete(prescriptionId) : newSet.add(prescriptionId);
      return newSet;
    });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const getPrescriptionTypeInfo = (prescription: Prescription) => {
    const medName = prescription.medication || '';
    if (medName.includes('treatment:') || medName.includes('therapy:')) {
      return { type: t('prescriptionsDisplay.therapyTreatment'), icon: Syringe, color: 'text-purple-600 dark:text-purple-400' };
    }
    if (medName.includes('procedure:')) {
      return { type: t('prescriptionsDisplay.procedure'), icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400' };
    }
    if (medName.includes('device:') || medName.includes('Medical Device')) {
      return { type: t('prescriptionsDisplay.medicalDevice'), icon: Activity, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    return { type: t('prescriptionsDisplay.medication'), icon: Pill, color: 'text-primary' };
  };

  const sortedPrescriptions = useMemo(() => {
    return prescriptions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [prescriptions]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Pill className="mr-2 h-5 w-5 text-primary" />
            {t('prescriptionsDisplay.prescriptions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-lg">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>{t('common.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <Pill className="mr-2 h-5 w-5 text-primary" />
            {t('prescriptionsDisplay.prescriptions')}
          </CardTitle>
          <div className="flex flex-col xs:flex-row w-full xs:w-auto gap-2">
            {session?.user?.role === 'doctor' && (
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="w-full xs:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span className="hidden xs:inline">{t('prescriptionsDisplay.addPrescription')}</span>
                <span className="xs:hidden">Add</span>
              </Button>
            )}
            <Link href={`/dashboard/ehr/patients/${patientId}/prescriptions`} passHref>
              <Button size="sm" variant="outline" className="w-full xs:w-auto">
                <span className="hidden xs:inline">{t('prescriptionsDisplay.fullView')}</span>
                <span className="xs:hidden">All</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {sortedPrescriptions.length > 0 ? (
          <div className="space-y-3">
            {sortedPrescriptions.map((prescription) => {
              const typeInfo = getPrescriptionTypeInfo(prescription);
              const TypeIcon = typeInfo.icon;
              const detailsExpanded = expandedDetails.has(prescription._id);
              const timelineExpanded = expandedTimelines.has(prescription._id);

              return (
                <div
                  key={prescription._id}
                  className="rounded-lg border bg-card shadow-sm overflow-hidden"
                >
                  {/* Main Compact Row - Always Visible */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-base truncate">
                              {prescription.medication || 'Unnamed Prescription'}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              prescription.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : prescription.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
                            }`}>
                              {t(`prescriptionsDisplay.status.${prescription.status}`)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{prescription.frequency}</span>
                            {prescription.dose && prescription.dose !== 'Not specified' && prescription.dose !== 'N/A' && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{prescription.dose}</span>
                              </>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {(prescription.status === 'active') && (session?.user?.role === 'nurse' || session?.user?.role === 'doctor' || session?.user?.role === 'admin') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setIsAdministerModalOpen(true);
                            }}
                            className="h-8 px-3 text-xs"
                          >
                            <Syringe className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden xs:inline">Administer</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleDetails(prescription._id)}
                          className="h-8 w-8 p-0"
                        >
                          {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {detailsExpanded && (
                    <div className="border-t px-3 pb-3 pt-2 space-y-3 text-sm">
                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                        {prescription.route && prescription.route !== 'As applicable' && (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('prescriptionsDisplay.route')}</p>
                              <p className="font-medium">{prescription.route}</p>
                            </div>
                          </div>
                        )}
                        {prescription.durationDays && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('prescriptionsDisplay.duration')}</p>
                              <p className="font-medium">{prescription.durationDays} {t('prescriptionsDisplay.days')}</p>
                            </div>
                          </div>
                        )}
                        {prescription.refills !== undefined && (
                          <div className="flex items-center gap-2">
                            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('prescriptionsDisplay.refills')}</p>
                              <p className="font-medium">{prescription.refills}</p>
                            </div>
                          </div>
                        )}
                        {prescription.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('prescriptionsDisplay.startDate')}</p>
                              <p className="font-medium">{new Date(prescription.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                        {prescription.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('prescriptionsDisplay.endDate')}</p>
                              <p className="font-medium">{new Date(prescription.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Text Blocks */}
                      <div className="space-y-2">
                        {prescription.instructions && (
                          <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-md p-2.5">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                              <FileText className="h-3.5 w-3.5" />
                              {t('prescriptionsDisplay.instructions')}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-200">{prescription.instructions}</p>
                          </div>
                        )}
                        {prescription.reasonForPrescription && (
                          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-md p-2.5">
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {t('prescriptionsDisplay.reasonForPrescription')}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-200">{prescription.reasonForPrescription}</p>
                          </div>
                        )}
                        {prescription.notes && (
                          <div className="bg-muted/50 rounded-md p-2.5">
                            <p className="text-xs font-medium flex items-center gap-1.5 mb-1">
                              <Info className="h-3.5 w-3.5" />
                              {t('prescriptionsDisplay.additionalNotes')}
                            </p>
                            <p className="text-xs">{prescription.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Timeline Trigger */}
                      {prescription.administrations && prescription.administrations.length > 0 && (
                        <button
                          onClick={() => toggleTimeline(prescription._id)}
                          className="w-full flex items-center justify-between py-2 px-3 -mx-3 hover:bg-accent/50 rounded-md transition-colors text-sm"
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <User className="h-4 w-4 text-primary" />
                            {t('prescriptionsDisplay.administrationTimeline')} ({prescription.administrations.length})
                          </span>
                          {timelineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Timeline Expanded Content */}
                  {timelineExpanded && prescription.administrations && (
                    <div className="border-t bg-muted/30 px-3 py-2">
                      <div className="space-y-2">
                        {prescription.administrations.slice(0, 4).map((admin, i) => (
                          <div key={admin._id || i} className="flex items-center justify-between text-xs py-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                admin.status === 'administered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                              }`}>
                                {t(`prescriptionsDisplay.administrationStatus.${admin.status}`)}
                              </span>
                              <span className="text-muted-foreground">
                                {(admin.administeredBy as any)?.fullName || 'N/A'}
                              </span>
                            </div>
                            <div className="text-right text-muted-foreground">
                              <div>{new Date(admin.administeredAt).toLocaleDateString()}</div>
                              <div className="text-xs">{new Date(admin.administeredAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                            </div>
                          </div>
                        ))}
                        {prescription.administrations.length > 4 && (
                          <p className="text-center text-xs text-muted-foreground pt-1">
                            +{prescription.administrations.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/30 rounded-lg">
            <Pill className="mx-auto h-9 w-9 text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">{t('prescriptionsDisplay.noPrescriptionsYet')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
              {t('prescriptionsDisplay.noPrescriptionsDescription')}
            </p>
            {session?.user?.role === 'doctor' && (
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-1.5 h-4 w-4" />
                {t('prescriptionsDisplay.addFirstPrescription')}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <AddPrescriptionModal
        patientId={patientId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPrescriptionAdded={fetchPrescriptions}
      />
      {selectedPrescription && (
        <AdministerPrescriptionModal
          isOpen={isAdministerModalOpen}
          onClose={() => setIsAdministerModalOpen(false)}
          prescription={selectedPrescription}
          onAdministrationAdded={fetchPrescriptions}
          enableBarcodeValidation={false}
        />
      )}
    </Card>
  );
};

export default PrescriptionsDisplay;