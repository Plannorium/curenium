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
import { ServerCrash, Pill, Calendar, Repeat, CheckCircle, PlusCircle, ArrowRight, User, Info, ChevronDown, ChevronUp, Activity, Stethoscope, Syringe, Clock, Package, FileText, AlertCircle } from "lucide-react";
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
      if (!res.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
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
      if (newSet.has(prescriptionId)) {
        newSet.delete(prescriptionId);
      } else {
        newSet.add(prescriptionId);
      }
      return newSet;
    });
  };

  const toggleDetails = (prescriptionId: string) => {
    setExpandedDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(prescriptionId)) {
        newSet.delete(prescriptionId);
      } else {
        newSet.add(prescriptionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start space-x-2 sm:space-x-3">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5 sm:mt-1" />
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-sm sm:text-base font-semibold break-words">{value}</p>
      </div>
    </div>
  );

  const getPrescriptionTypeInfo = (prescription: Prescription) => {
    // Try to determine type from medication name pattern
    const medName = prescription.medication || '';
    if (medName.includes('treatment:') || medName.includes('therapy:')) {
      return { type: t('prescriptionsDisplay.therapyTreatment'), icon: Syringe, color: 'text-purple-600' };
    }
    if (medName.includes('procedure:')) {
      return { type: t('prescriptionsDisplay.procedure'), icon: Stethoscope, color: 'text-blue-600' };
    }
    if (medName.includes('device:') || medName.includes('Medical Device')) {
      return { type: t('prescriptionsDisplay.medicalDevice'), icon: Activity, color: 'text-green-600' };
    }
    // Default to medication
    return { type: t('prescriptionsDisplay.medication'), icon: Pill, color: 'text-primary' };
  };

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Pill className="mr-3 h-6 w-6 text-primary" />
            {t('prescriptionsDisplay.prescriptions')}
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
        <AlertTitle>{t('common.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col space-y-4 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Pill className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-2xl">{t('prescriptionsDisplay.prescriptions')}</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {session?.user?.role === 'doctor' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="w-full sm:w-auto bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm sm:text-base">{t('prescriptionsDisplay.addPrescription')}</span>
            </Button>
            )}
            <Link href={`/dashboard/ehr/patients/${patientId}/prescriptions`} passHref>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="hidden sm:inline text-sm sm:text-base">{t('prescriptionsDisplay.fullView')}</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 1).map((prescription, index) => {
              const typeInfo = getPrescriptionTypeInfo(prescription);
              const TypeIcon = typeInfo.icon;

              return (
                <div key={prescription._id} className="bg-white/90 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Header with Type and Status */}
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0`}>
                        <TypeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                            {prescription.medication || 'Unnamed Prescription'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto flex-shrink-0 ${
                            prescription.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : prescription.status === 'completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          }`}>
                            {t(`prescriptionsDisplay.status.${prescription.status}`)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{typeInfo.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {(session?.user?.role === 'nurse') && !prescription.dispensed && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsAdministerModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto cursor-pointer"
                        >
                          <Syringe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">{t('prescriptionsDisplay.administer')}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details Toggle Button */}
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDetails(prescription._id)}
                      className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors p-2 rounded-lg"
                    >
                      {expandedDetails.has(prescription._id) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          <span className="text-sm">{t('prescriptionsDisplay.hideDetails')}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          <span className="text-sm">{t('prescriptionsDisplay.showDetails')}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Collapsible Details */}
                  {expandedDetails.has(prescription._id) && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      {/* Professional Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {prescription.dose && prescription.dose !== 'Not specified' && prescription.dose !== 'N/A' && (
                          <InfoItem icon={Package} label={t('prescriptionsDisplay.strengthDose')} value={prescription.dose} />
                        )}
                        <InfoItem icon={Repeat} label={t('prescriptionsDisplay.frequency')} value={prescription.frequency} />
                        {prescription.route && prescription.route !== 'As applicable' && (
                          <InfoItem icon={ArrowRight} label={t('prescriptionsDisplay.route')} value={prescription.route} />
                        )}
                        {prescription.durationDays && (
                          <InfoItem icon={Clock} label={t('prescriptionsDisplay.duration')} value={`${prescription.durationDays} ${t('prescriptionsDisplay.days')}`} />
                        )}
                        {prescription.refills && (
                          <InfoItem icon={Repeat} label={t('prescriptionsDisplay.refills')} value={prescription.refills.toString()} />
                        )}
                        <InfoItem icon={Calendar} label={t('prescriptionsDisplay.prescribed')} value={new Date(prescription.createdAt).toLocaleDateString()} />
                        {prescription.startDate && (
                          <InfoItem icon={Calendar} label={t('prescriptionsDisplay.startDate')} value={new Date(prescription.startDate).toLocaleDateString()} />
                        )}
                        {prescription.endDate && (
                          <InfoItem icon={Calendar} label={t('prescriptionsDisplay.endDate')} value={new Date(prescription.endDate).toLocaleDateString()} />
                        )}
                      </div>

                      {/* Instructions and Reason */}
                      <div className="space-y-3">
                        {prescription.instructions && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                            <h4 className="font-semibold flex items-center text-blue-800 dark:text-blue-300 mb-2 text-sm sm:text-base">
                              <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              {t('prescriptionsDisplay.instructions')}
                            </h4>
                            <p className="text-blue-700 dark:text-blue-200 text-xs sm:text-sm leading-relaxed">{prescription.instructions}</p>
                          </div>
                        )}

                        {prescription.reasonForPrescription && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
                            <h4 className="font-semibold flex items-center text-amber-800 dark:text-amber-300 mb-2 text-sm sm:text-base">
                              <AlertCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              {t('prescriptionsDisplay.reasonForPrescription')}
                            </h4>
                            <p className="text-amber-700 dark:text-amber-200 text-xs sm:text-sm leading-relaxed">{prescription.reasonForPrescription}</p>
                          </div>
                        )}

                        {prescription.notes && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                            <h4 className="font-semibold flex items-center text-gray-800 dark:text-gray-300 mb-2 text-sm sm:text-base">
                              <Info className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              {t('prescriptionsDisplay.additionalNotes')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-relaxed">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Administration Timeline */}
                  {prescription.administrations && prescription.administrations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => toggleTimeline(prescription._id)}
                        className="w-full flex items-center justify-between text-base sm:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex items-center">
                          <User className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary"/>
                          <span className="text-sm sm:text-base">{t('prescriptionsDisplay.administrationTimeline')}</span>
                        </div>
                        {expandedTimelines.has(prescription._id) ? (
                          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                      {expandedTimelines.has(prescription._id) && (
                        <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:inset-0 before:ml-3 sm:before:ml-5 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                          {prescription.administrations.map((admin, index) => (
                            <div key={admin._id || index} className="relative">
                              <div className="absolute -left-2 sm:-left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary"></div>
                              <div className="ml-4 sm:ml-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                                  <span className={`font-semibold px-3 py-1 rounded-full text-xs self-start sm:self-auto ${
                                    admin.status === 'administered'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                  }`}>
                                    {t(`prescriptionsDisplay.administrationStatus.${admin.status}`)}
                                  </span>
                                  <div className="text-left sm:text-right text-xs text-gray-500 dark:text-gray-400">
                                    <div>{new Date(admin.administeredAt).toLocaleDateString()}</div>
                                    <div className="font-semibold">{new Date(admin.administeredAt).toLocaleTimeString()}</div>
                                  </div>
                                </div>
                                <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
                                  {t('prescriptionsDisplay.administeredBy')}: <span className="font-medium text-gray-900 dark:text-gray-100">{(admin.administeredBy as any)?.fullName || 'N/A'}</span>
                                </p>
                                {admin.doseAdministered && <p className="text-sm text-gray-600 dark:text-gray-400">{t('prescriptionsDisplay.dose')}: {admin.doseAdministered}</p>}
                                {admin.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{t('prescriptionsDisplay.notes')}: {admin.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-12 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-4">
            <Pill className="mx-auto h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-gray-400 dark:text-gray-500 mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('prescriptionsDisplay.noPrescriptionsYet')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 md:mb-6 max-w-md mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
              {t('prescriptionsDisplay.noPrescriptionsDescription')}
            </p>
            {session?.user?.role === 'doctor' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">{t('prescriptionsDisplay.addFirstPrescription')}</span>
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
        />
      )}
    </Card>
  );
};

export default PrescriptionsDisplay;