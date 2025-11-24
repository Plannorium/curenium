"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prescription } from "@/types/prescription";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Pill, Calendar, Repeat, CheckCircle, PlusCircle, ArrowRight, User, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { AddPrescriptionModal } from "./AddPrescriptionModal";
import { AdministerPrescriptionModal } from './AdministerPrescriptionModal';

interface PrescriptionsDisplayProps {
  patientId: string;
}

const PrescriptionsDisplay = ({ patientId }: PrescriptionsDisplayProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdministerModalOpen, setIsAdministerModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

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

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-primary shrink-0 mt-1" />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-semibold">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Pill className="mr-3 h-6 w-6 text-primary" />
            Prescriptions
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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Pill className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">Prescriptions</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          {session?.user?.role === 'doctor' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="w-full sm:w-auto bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm sm:text-base">Add Prescription</span>
          </Button>
          )}
          <Link href={`/dashboard/ehr/patients/${patientId}/prescriptions`} passHref>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span className="text-sm sm:text-base">Full View</span>
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div key={prescription._id} className="bg-white/80 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start space-x-3">
                    <Pill className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Medications</p>
                      <div className="space-y-1">
                        {(prescription.medications || (prescription.medication ? [prescription.medication] : [])).map((med, idx) => (
                          <p key={idx} className="text-md font-semibold">{med}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <InfoItem icon={Calendar} label="Dosage" value={prescription.dose} />
                  <InfoItem icon={Repeat} label="Frequency" value={prescription.frequency} />
                  <InfoItem icon={CheckCircle} label="Status" value={prescription.status} />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {prescription.route && <InfoItem icon={ArrowRight} label="Route" value={prescription.route} />}
                  {prescription.durationDays && <InfoItem icon={Calendar} label="Duration" value={`${prescription.durationDays} days`} />}
                  {prescription.startDate && <InfoItem icon={Calendar} label="Start Date" value={new Date(prescription.startDate).toLocaleDateString()} />}
                  {prescription.endDate && <InfoItem icon={Calendar} label="End Date" value={new Date(prescription.endDate).toLocaleDateString()} />}
                  {prescription.refills && <InfoItem icon={Repeat} label="Refills" value={prescription.refills.toString()} />}
                  <InfoItem icon={Calendar} label="Prescribed On" value={new Date(prescription.createdAt).toLocaleDateString()} />
                </div>
                {prescription.instructions && (
                  <div className="mt-4">
                    <h4 className="font-semibold flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/> Instructions</h4>
                    <p>{prescription.instructions}</p>
                  </div>
                )}
                {prescription.reasonForPrescription && (
                  <div className="mt-4">
                    <h4 className="font-semibold flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/> Reason for Prescription</h4>
                    <p>{prescription.reasonForPrescription}</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  {session?.user?.role === 'nurse' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedPrescription(prescription);
                        setIsAdministerModalOpen(true);
                      }}
                    >
                      Administer
                    </Button>
                  )}
                </div>
                {prescription.administrations && prescription.administrations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleTimeline(prescription._id)}
                      className="w-full flex items-center justify-between text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
                    >
                      <div className="flex items-center">
                        <User className="mr-3 h-6 w-6 text-primary"/>
                        Administration Timeline
                      </div>
                      {expandedTimelines.has(prescription._id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    {expandedTimelines.has(prescription._id) && (
                      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                        {prescription.administrations.map((admin, index) => (
                          <div key={admin._id || index} className="relative">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary"></div>
                            <div className="ml-6">
                              <div className="flex justify-between items-center">
                                <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                                  admin.status === 'administered'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                }`}>
                                  {admin.status.replace('_', ' ')}
                                </span>
                                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                  <div>{new Date(admin.administeredAt).toLocaleDateString()}</div>
                                  <div className="font-semibold">{new Date(admin.administeredAt).toLocaleTimeString()}</div>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-700 dark:text-gray-300">
                                Administered by: <span className="font-medium text-gray-900 dark:text-gray-100">{(admin.administeredBy as any)?.fullName || 'N/A'}</span>
                              </p>
                              {admin.doseAdministered && <p className="text-sm text-gray-600 dark:text-gray-400">Dose: {admin.doseAdministered}</p>}
                              {admin.notes && <p className="text-sm text-gray-600 dark:text-gray-400">Notes: {admin.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Pill className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Prescriptions Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Prescriptions and medications will be displayed here once they are prescribed.
            </p>
            {session?.user?.role === 'doctor' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Add First Prescription</span>
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