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
  HeartHandshake,
  FileText,
  Activity,
  Pill,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Users,
  Stethoscope,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import VitalsDisplay from "../../../components/patients/VitalsDisplay";
import PrescriptionsDisplay from "../../../components/patients/PrescriptionsDisplay";
import AppointmentsDisplay from "../../../components/patients/AppointmentsDisplay";
import ClinicalNotesDisplay from "../../../components/patients/ClinicalNotesDisplay";
import LabOrdersDisplay from "../../../components/patients/LabOrdersDisplay";
import LabResultsDisplay from "../../../components/patients/LabResultsDisplay";
import Link from "next/link";

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
  status?: string;
  assignedNurse?: string;
  ward?: string;
  department?: string;
  admissionType?: string;
  careLevel?: string;
}

// Nurse-specific workflow steps
const NURSE_WORKFLOW_STEPS = [
  { id: 'assessment', label: 'Patient Assessment', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'monitoring', label: 'Vital Signs Monitoring', icon: Activity, color: 'bg-green-500' },
  { id: 'medication', label: 'Medication Administration', icon: Pill, color: 'bg-purple-500' },
  { id: 'documentation', label: 'Care Documentation', icon: FileText, color: 'bg-orange-500' },
  { id: 'followup', label: 'Patient Care Planning', icon: Heart, color: 'bg-pink-500' }
];

const NursesDashboard = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'patient-search' | 'patient-care' | 'assigned-patients'>('overview');
  const [previousView, setPreviousView] = useState<'overview' | 'patient-search' | 'assigned-patients'>('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(NURSE_WORKFLOW_STEPS[0].id);

  // Fetch patients when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchPatients(searchQuery);
      } else {
        setPatients([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch assigned patients on component mount
  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const fetchPatients = async (query: string) => {
    if (!query.trim()) {
      setPatients([]);
      return;
    }

    try {
      setLoading(true);
      const sessionResponse = await fetch('/api/auth/session');
      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session');
      }
      const session: { user?: { id: string } } = await sessionResponse.json();
      
      const url = session?.user?.id 
        ? `/api/patients?q=${encodeURIComponent(query)}&assignedNurse=${session.user.id}`
        : `/api/patients?q=${encodeURIComponent(query)}`;

      const response = await fetch(url);
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

  const fetchAssignedPatients = async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session');
      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session');
      }
      const session: { user?: { id: string } } = await sessionResponse.json();

      if (!session?.user?.id) {
        // If no user is logged in, there are no assigned patients
        setAssignedPatients([]);
        return;
      }

      const response = await fetch(`/api/patients?assignedNurse=${session.user.id}`);
      if (response.ok) {
        const data: Patient[] = await response.json();
        setAssignedPatients(data);
      } else {
        toast.error("Failed to fetch assigned patients");
        setAssignedPatients([]);
      }
    } catch (error) {
      console.error("Failed to fetch assigned patients:", error);
      toast.error("Error fetching assigned patients");
      setAssignedPatients([]);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const mrn = patient.mrn?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || mrn.includes(query);
  });

  const handlePatientSelect = (patient: Patient) => {
    setPreviousView(currentView as 'overview' | 'patient-search' | 'assigned-patients');
    setSelectedPatient(patient);
    setCurrentView('patient-care');
    setActiveWorkflowStep(NURSE_WORKFLOW_STEPS[0].id);
    fetchAssignedPatients(); // Re-fetch assigned patients
  };

  const handleBack = () => {
    setCurrentView(previousView);
    setSelectedPatient(null);
  };

  const renderOverview = () => (
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
          <HeartHandshake className="h-10 w-10 text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            Nursing Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Comprehensive patient care and monitoring
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        <Card
          className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50"
          onClick={() => setCurrentView('patient-search')}
        >
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Search Patients</h3>
            <p className="text-muted-foreground mb-4">
              Find and access patient records across the system
            </p>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50"
          onClick={() => setCurrentView('assigned-patients')}
        >
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">My Patients</h3>
            <p className="text-muted-foreground mb-4">
              {assignedPatients.length} patients under your care
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {assignedPatients.length} Active
              </Badge>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity - Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Activity Feed Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Real-time activity tracking for patient care actions will be available soon.
                This will show vital sign recordings, medication administrations, and other care activities.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderPatientSearch = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Patient Search
            </h1>
            <p className="text-muted-foreground mt-1">
              Search and access patient records
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
        transition={{ delay: 0.2 }}
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

  const renderAssignedPatients = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Link href={"/dashboard/ehr/nurses-dashboard"}> */}
          <Button
            variant="ghost"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={handleBack}
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
            {/* </Link> */}
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              My Patients
            </h1>
            <p className="text-muted-foreground mt-1">
              Patients currently under your care
            </p>
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {assignedPatients.length > 0 ? (
          assignedPatients.map((patient, index) => (
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
        ) : (
          <div className="col-span-full text-center py-16">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No patients assigned
            </h3>
            <p className="text-muted-foreground">
              You currently have no patients assigned to your care.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderPatientCare = () => (
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
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:block">
              Back to Overview
            </span>
          </Button>
          <div className="lg:hidden">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Heart className="h-3 w-3 mr-1" />
              Under Care
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-start space-x-2 mb-5">
          <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedPatient?.firstName[0]}{selectedPatient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 lg:flex-initial">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {selectedPatient?.mrn && `MRN: ${selectedPatient.mrn}`}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Heart className="h-3 w-3 mr-1" />
              Under Care
            </Badge>
          </div>
        </div>
      </div>

      {/* Nursing Workflow Steps */}
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Nursing Care Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeWorkflowStep} onValueChange={setActiveWorkflowStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-8 h-auto p-1">
              {NURSE_WORKFLOW_STEPS.map((step, index) => (
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
                {renderNursingWorkflowContent()}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderNursingWorkflowContent = () => {
    if (!selectedPatient) return null;

    switch (activeWorkflowStep) {
      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Patient Assessment
              </h3>
              <p className="text-muted-foreground">
                Review patient history and current status
              </p>
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

      case 'monitoring':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Vital Signs Monitoring
              </h3>
              <p className="text-muted-foreground">
                Monitor and record patient vital signs
              </p>
            </div>
            <VitalsDisplay patientId={selectedPatient._id} />
            <LabResultsDisplay patientId={selectedPatient._id} />
          </div>
        );

      case 'medication':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Medication Administration
              </h3>
              <p className="text-muted-foreground">
                Manage and administer patient medications
              </p>
            </div>
            <PrescriptionsDisplay patientId={selectedPatient._id} />
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Care Documentation
              </h3>
              <p className="text-muted-foreground">
                Document nursing care and observations
              </p>
            </div>
            <ClinicalNotesDisplay patientId={selectedPatient._id} />
          </div>
        );

      case 'followup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Patient Care Planning
              </h3>
              <p className="text-muted-foreground">
                Plan and schedule follow-up care
              </p>
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
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'patient-search' && renderPatientSearch()}
          {currentView === 'assigned-patients' && renderAssignedPatients()}
          {currentView === 'patient-care' && selectedPatient && renderPatientCare()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NursesDashboard;