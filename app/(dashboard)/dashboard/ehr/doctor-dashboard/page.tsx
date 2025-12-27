 "use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  User,
  Stethoscope,
  FileText,
  Calendar,
  Pill,
  Activity,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Brain,
  Shield,
  Clock,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import CreateDiagnosis from "./components/CreateDiagnosis";
import ConsentForm from "./components/ConsentForm";
import VitalsDisplay from "../../../components/patients/VitalsDisplay";
import PrescriptionsDisplay from "../../../components/patients/PrescriptionsDisplay";
import AppointmentsDisplay from "../../../components/patients/AppointmentsDisplay";
import ClinicalNotesDisplay from "../../../components/patients/ClinicalNotesDisplay";
import LabOrdersDisplay from "../../../components/patients/LabOrdersDisplay";
import InsuranceDisplay from "../../../components/patients/InsuranceDisplay";
import AuditLogDisplay from "../../../components/patients/AuditLogDisplay";
import { AddPrescriptionModal } from "../../../components/patients/AddPrescriptionModal";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import { Department, Ward } from '@/types/schema';

// Types
interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  mrn?: string;
  gender?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  admissionDate?: string;
  admissionType?: string;
  department?: string; // ID from patient data
  ward?: string; // ID from patient data
}

// Workflow steps
const getWorkflowSteps = (t: (key: string) => string) => [
  { id: 'assessment', label: t('doctorDashboard.patientAssessment'), icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'diagnosis', label: t('doctorDashboard.diagnosisAndTreatment'), icon: Brain, color: 'bg-purple-500' },
  { id: 'prescription', label: t('doctorDashboard.prescriptionManagement'), icon: Pill, color: 'bg-green-500' },
  { id: 'documentation', label: t('doctorDashboard.documentationAndConsent'), icon: FileText, color: 'bg-orange-500' },
  { id: 'followup', label: t('doctorDashboard.followupAndScheduling'), icon: Calendar, color: 'bg-pink-500' }
];

interface Diagnosis {
  _id: string;
  diagnosisCode: string;
  description: string;
  severity: string;
  onsetDate?: string;
  documentedBy: {
    firstName: string;
    lastName: string;
    image?: string;
  };
  documentedAt: string;
}

interface UserData {
  firstName: string;
  lastName: string;
}

const DoctorDashboard = () => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [currentStep, setCurrentStep] = useState<'select-patient' | 'workflow'>('select-patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState('assessment');
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [wardName, setWardName] = useState<string>('');
  const [wardNumber, setWardNumber] = useState<string>('');

  const patientIdRef = useRef<string | null>(null);

  // Fetch patients when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchPatients = async (query: string) => {
    if (!query.trim()) {
      setPatients([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data: Patient[] = await response.json();
        setPatients(data);
      } else {
        toast.error("Failed to fetch patients");
        setPatients([]);
      }
    } catch (error) {
      toast.error("Error fetching patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const mrn = patient.mrn?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || mrn.includes(query);
  });

  const fetchDiagnoses = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/diagnoses`);
      if (response.ok) {
        const data: any[] = await response.json();

        // Process diagnoses - documentedBy should already be populated by the API
        const processedDiagnoses = data.map((diagnosis) => {
          // Check if documentedBy is already populated (object) or just an ID (string)
          if (typeof diagnosis.documentedBy === 'object' && diagnosis.documentedBy !== null) {
            // Already populated - split fullName into first and last
            const fullName = diagnosis.documentedBy.fullName || 'Unknown User';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            return {
              ...diagnosis,
              documentedBy: {
                firstName,
                lastName,
                image: diagnosis.documentedBy.image
              }
            };
          } else {
            // Not populated, use fallback
            return {
              ...diagnosis,
              documentedBy: {
                firstName: 'Unknown',
                lastName: 'User'
              }
            };
          }
        });

        setDiagnoses(processedDiagnoses);
      }
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
    }
  };

  const fetchDepartmentName = async (departmentId: string) => {
    const currentPatientId = patientIdRef.current;
    try {
      const response = await fetch(`/api/departments/${departmentId}`);
      if (response.ok) {
        const department: Department = await response.json();
        // Only update if we're still on the same patient
        if (patientIdRef.current === currentPatientId) {
          setDepartmentName(department.name);
        }
      } else {
        toast.error("Failed to fetch department name");
      }
    } catch (error) {
      console.error('Error fetching department name:', error);
      toast.error("Error fetching department name");
    }
  };

  const fetchWardName = async (wardId: string) => {
    const currentPatientId = patientIdRef.current;
    try {
      const response = await fetch(`/api/wards/${wardId}`);
      if (response.ok) {
        const ward: Ward = await response.json();
        // Only update if we're still on the same patient
        if (patientIdRef.current === currentPatientId) {
          setWardName(ward.name);
          setWardNumber(ward.wardNumber);
        }
      } else {
        toast.error("Failed to fetch ward name");
      }
    } catch (error) {
      console.error('Error fetching ward:', error);
      toast.error("Error fetching ward name");
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    patientIdRef.current = patient._id;
    setSelectedPatient(patient);
    setCurrentStep('workflow');
    setActiveWorkflowStep('assessment');
    fetchDiagnoses(patient._id);

    // Fetch department and ward names
    if (patient.department) {
      fetchDepartmentName(patient.department);
    } else {
      setDepartmentName('');
    }

    if (patient.ward) {
      fetchWardName(patient.ward);
    } else {
      setWardName('');
      setWardNumber('');
    }
  };

  const handleBackToPatientSelection = () => {
    setCurrentStep('select-patient');
    setSelectedPatient(null);
  };

  const renderPatientSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary to-primary/80 rounded-full shadow-2xl"
        >
          <Stethoscope className="h-10 w-10 text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            {t('doctorDashboard.title')}
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            {t('doctorDashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('doctorDashboard.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-primary/50 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patient Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {loading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient, index) => (
            <motion.div
              key={patient._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50"
                onClick={() => handlePatientSelect(patient)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      {patient.mrn && (
                        <p className="text-sm text-muted-foreground">{t('doctorDashboard.mrn')}: {patient.mrn}</p>
                      )}
                      {patient.dob && (
                        <p className="text-sm text-muted-foreground">
                          Age: {new Date().getFullYear() - new Date(patient.dob).getFullYear()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : searchQuery.trim() ? (
          <div className="col-span-full text-center py-16">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('doctorDashboard.noPatientsFound')}
            </h3>
            <p className="text-muted-foreground">
              {t('doctorDashboard.noPatientsFoundDesc')}
            </p>
          </div>
        ) : (
          <div className="col-span-full text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('doctorDashboard.searchForPatients')}
            </h3>
            <p className="text-muted-foreground">
              {t('doctorDashboard.searchForPatientsDesc')}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderWorkflow = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header with Patient Info */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center justify-between lg:justify-start">
          <Button
            variant="ghost"
            onClick={handleBackToPatientSelection}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:block">
              {t('doctorDashboard.backToPatients')}
            </span>
          </Button>
          <div className="lg:hidden">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Heart className="h-3 w-3 mr-1" />
              Active Patient
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-start space-x-3">
          <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedPatient?.firstName[0]}{selectedPatient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 lg:flex-initial">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {selectedPatient?.mrn && `${t('doctorDashboard.mrn')}: ${selectedPatient.mrn}`}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-2 mb-5">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Heart className="h-3 w-3 mr-1" />
              {t('doctorDashboard.activePatient')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            {t('doctorDashboard.medicalWorkflow')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeWorkflowStep} onValueChange={setActiveWorkflowStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-8 h-auto p-1">
              {getWorkflowSteps(t).map((step, index) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="flex flex-col items-center space-y-1 py-3 px-2 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <div className={`p-2 rounded-lg ${step.color} text-white shadow-sm`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight hidden sm:block">
                    {step.label}
                  </span>
                  <span className="text-xs font-medium text-center leading-tight sm:hidden">
                    {step.label.split(' ')[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Workflow Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWorkflowStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px] mt-10"
              >
                {renderWorkflowContent()}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderWorkflowContent = () => {
    if (!selectedPatient) return null;

    switch (activeWorkflowStep) {
      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('doctorDashboard.patientAssessment')}
                </h3>
                <p className="text-muted-foreground">
                  {t('doctorDashboard.patientAssessmentDesc')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToPatientSelection}
                className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Patient Overview */}
            <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  {t('doctorDashboard.patientOverview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.fullName')}</Label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                    </div>
                    {selectedPatient.mrn && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.mrn')}</Label>
                        <p className="text-gray-900 dark:text-white font-mono">{selectedPatient.mrn}</p>
                      </div>
                    )}
                    {selectedPatient.dob && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.dateOfBirth')}</Label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(selectedPatient.dob).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          <span className="text-muted-foreground ml-2">
                            ({new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} years old)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedPatient.contact?.email && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.email')}</Label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.contact.email}</p>
                      </div>
                    )}
                    {selectedPatient.contact?.phone && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.phone')}</Label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.contact.phone}</p>
                      </div>
                    )}
                    {selectedPatient.gender && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.gender')}</Label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedPatient.gender}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Admission Info */}
                    {selectedPatient.admissionDate && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.admissionDate')}</Label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(selectedPatient.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedPatient.admissionType && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.admissionType')}</Label>
                        <Badge variant="outline" className="capitalize">
                          {selectedPatient.admissionType}
                        </Badge>
                      </div>
                    )}
                    {selectedPatient.department && departmentName && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.department')}</Label>
                        <p className="text-gray-900 dark:text-white">{departmentName}</p>
                      </div>
                    )}
                    {selectedPatient.ward && wardName && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.ward')}</Label>
                        <p className="text-gray-900 dark:text-white">
                          {wardName}{wardNumber ? ` (${wardNumber})` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'diagnosis':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('doctorDashboard.diagnosisAndTreatment')}
                </h3>
                <p className="text-muted-foreground">
                  {t('doctorDashboard.diagnosisAndTreatmentDesc')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToPatientSelection}
                className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Create Diagnosis Button */}
            <div className="text-center">
              <CreateDiagnosis
                patientId={selectedPatient._id}
                onDiagnosisCreated={() => {
                  toast.success("Diagnosis created successfully!");
                  fetchDiagnoses(selectedPatient._id); // Refresh the list
                }}
              >
                <Button className="bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  {t('doctorDashboard.createDiagnosis')}
                </Button>
              </CreateDiagnosis>
            </div>

            {/* Diagnosis History */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('doctorDashboard.diagnosisHistory')}
              </h4>
              {diagnoses.length > 0 ? (
                <div className="grid gap-4">
                  {diagnoses.map((diagnosis) => (
                    <Card
                      key={diagnosis._id}
                      className="cursor-pointer hover:shadow-lg transition-shadow bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50"
                      onClick={() => {
                        setSelectedDiagnosis(diagnosis);
                        setDiagnosisModalOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={diagnosis.documentedBy.image} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {diagnosis.documentedBy.firstName[0]}{diagnosis.documentedBy.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={`${
                                  diagnosis.severity === 'mild' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {diagnosis.severity}
                                </Badge>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {diagnosis.diagnosisCode}
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-medium mb-1 truncate">
                                {diagnosis.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                {diagnosis.onsetDate && (
                                  <span>
                                    Onset: {new Date(diagnosis.onsetDate).toLocaleDateString()}
                                  </span>
                                )}
                                <span className="truncate">
                                  By: {diagnosis.documentedBy.firstName} {diagnosis.documentedBy.lastName}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t('doctorDashboard.noDiagnosesRecorded')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'prescription':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('doctorDashboard.prescriptionManagement')}
                </h3>
                <p className="text-muted-foreground hidden lg:block">
                  {t('doctorDashboard.prescriptionManagementDesc')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPrescriptionModalOpen(true)}
                  className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-3 w-3 lg:mr-2" />
                  <span className="hidden md:block">
                  {t('doctorDashboard.addPrescription')}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToPatientSelection}
                  className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <PrescriptionsDisplay patientId={selectedPatient._id} />
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('doctorDashboard.documentationAndConsent')}
                </h3>
                <p className="text-muted-foreground">
                  {t('doctorDashboard.documentationAndConsentDesc')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToPatientSelection}
                className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Consent Form Section */}
            <ConsentForm
              patientId={selectedPatient._id}
              onConsentUploaded={() => {
                toast.success("Consent form uploaded successfully!");
              }}
            />

            {/* Additional Documentation Options */}
            <ClinicalNotesDisplay patientId={selectedPatient._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <InsuranceDisplay patientId={selectedPatient._id} />
              <AuditLogDisplay patientId={selectedPatient._id} />
              <LabOrdersDisplay patientId={selectedPatient._id} />
            </div>
          </div>
        );

      case 'followup':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('doctorDashboard.followupAndScheduling')}
                </h3>
                <p className="text-muted-foreground">
                  {t('doctorDashboard.followupAndSchedulingDesc')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToPatientSelection}
                className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <AppointmentsDisplay patientId={selectedPatient._id} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-2.5 md:px-4 py-4 md:py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'select-patient' ? renderPatientSelection() : renderWorkflow()}
        </AnimatePresence>
      </div>

      {/* Diagnosis Details Modal */}
      {selectedDiagnosis && (
        <Dialog open={diagnosisModalOpen} onOpenChange={setDiagnosisModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shadow-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <DialogTitle className="text-xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  {t('doctorDashboard.diagnosisDetails')}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.icd10Code')}</Label>
                    <p className="text-lg font-mono text-gray-900 dark:text-white">{selectedDiagnosis.diagnosisCode}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.severity')}</Label>
                    <Badge className={`mt-1 ${
                      selectedDiagnosis.severity === 'mild' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      selectedDiagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedDiagnosis.severity}
                    </Badge>
                  </div>

                  {selectedDiagnosis.onsetDate && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.onsetDate')}</Label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedDiagnosis.onsetDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.documentedBy')}</Label>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedDiagnosis.documentedBy.image} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {selectedDiagnosis.documentedBy.firstName[0]}{selectedDiagnosis.documentedBy.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-900 dark:text-white">
                        {selectedDiagnosis.documentedBy.firstName} {selectedDiagnosis.documentedBy.lastName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.documentedAt')}</Label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedDiagnosis.documentedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('doctorDashboard.description')}</Label>
                <p className="text-gray-900 dark:text-white mt-1 leading-relaxed">
                  {selectedDiagnosis.description}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Prescription Modal */}
      <AddPrescriptionModal
        patientId={selectedPatient?._id || ''}
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        onPrescriptionAdded={() => {
          toast.success("Prescription added successfully!");
          setPrescriptionModalOpen(false);
        }}
      />
    </div>
  );
};

export default DoctorDashboard;