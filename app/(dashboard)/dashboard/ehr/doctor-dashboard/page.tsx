 "use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X
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

// Types
interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  mrn?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

// Workflow steps
const WORKFLOW_STEPS = [
  { id: 'assessment', label: 'Patient Assessment', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'diagnosis', label: 'Diagnosis & Treatment', icon: Brain, color: 'bg-purple-500' },
  { id: 'prescription', label: 'Prescription Management', icon: Pill, color: 'bg-green-500' },
  { id: 'documentation', label: 'Documentation', icon: FileText, color: 'bg-orange-500' },
  { id: 'followup', label: 'Follow-up & Scheduling', icon: Calendar, color: 'bg-pink-500' }
];

const DoctorDashboard = () => {
  const [currentStep, setCurrentStep] = useState<'select-patient' | 'workflow'>('select-patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(WORKFLOW_STEPS[0].id);

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep('workflow');
    setActiveWorkflowStep(WORKFLOW_STEPS[0].id);
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
            Physician Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Select a patient to begin your medical workflow
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
                placeholder="Search patients by name or MRN..."
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
                        <p className="text-sm text-muted-foreground">MRN: {patient.mrn}</p>
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
              No patients found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or check the spelling
            </p>
          </div>
        ) : (
          <div className="col-span-full text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for patients
            </h3>
            <p className="text-muted-foreground">
              Enter a patient name or MRN in the search box above to get started
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Button
            variant="ghost"
            onClick={handleBackToPatientSelection}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 lg:mr-2" />
           <span className="hidden lg:block">
             Back to Patients
            </span>
          </Button>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedPatient?.firstName[0]}{selectedPatient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedPatient?.mrn && `MRN: ${selectedPatient.mrn}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Heart className="h-3 w-3 mr-1" />
            Active Patient
          </Badge>
        </div>
      </div>

      {/* Workflow Steps */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Medical Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeWorkflowStep} onValueChange={setActiveWorkflowStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-8 h-auto p-1">
              {WORKFLOW_STEPS.map((step, index) => (
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
                  Patient Assessment
                </h3>
                <p className="text-muted-foreground">
                  Review patient history and current status
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VitalsDisplay patientId={selectedPatient._id} />
              <PrescriptionsDisplay patientId={selectedPatient._id} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClinicalNotesDisplay patientId={selectedPatient._id} />
              <LabOrdersDisplay patientId={selectedPatient._id} />
            </div>
          </div>
        );

      case 'diagnosis':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Diagnosis & Treatment
                </h3>
                <p className="text-muted-foreground">
                  Create diagnoses and treatment plans for the patient
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
            <CreateDiagnosis
              patientId={selectedPatient._id}
              onDiagnosisCreated={() => {
                toast.success("Diagnosis created successfully!");
              }}
            />
          </div>
        );

      case 'prescription':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Prescription Management
                </h3>
                <p className="text-muted-foreground">
                  Manage patient prescriptions and medications
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
            <PrescriptionsDisplay patientId={selectedPatient._id} />
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Documentation & Consent
                </h3>
                <p className="text-muted-foreground">
                  Complete patient documentation and manage consent forms
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
            </div>
          </div>
        );

      case 'followup':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Follow-up & Scheduling
                </h3>
                <p className="text-muted-foreground">
                  Schedule follow-ups and manage appointments
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
    </div>
  );
};

export default DoctorDashboard;