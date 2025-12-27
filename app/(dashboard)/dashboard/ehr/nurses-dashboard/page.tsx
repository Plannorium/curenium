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
import HandoffReportsDisplay from "../../../components/patients/HandoffReportsDisplay";
import LabOrdersDisplay from "../../../components/patients/LabOrdersDisplay";
import LabResultsDisplay from "../../../components/patients/LabResultsDisplay";
import NursingCarePlanDisplay from "../../../components/patients/NursingCarePlanDisplay";
import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import { useSession } from 'next-auth/react';

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
  ward?: string; // ID from patient data
  department?: string; // ID from patient data
  admissionType?: string;
  careLevel?: string;
}

// Nurse-specific workflow steps
const getNurseWorkflowSteps = (t: (key: string) => string) => [
  { id: 'assessment', label: t('nurseDashboard.patientAssessment'), icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'monitoring', label: t('nurseDashboard.vitalSignsMonitoring'), icon: Activity, color: 'bg-green-500' },
  { id: 'medication', label: t('nurseDashboard.medicationAdministration'), icon: Pill, color: 'bg-purple-500' },
  { id: 'documentation', label: t('nurseDashboard.careDocumentation'), icon: FileText, color: 'bg-orange-500' },
  { id: 'careplanning', label: t('nurseDashboard.nursingCarePlanning'), icon: HeartHandshake, color: 'bg-pink-500' }
];

const NursesDashboard = () => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [currentView, setCurrentView] = useState<'overview' | 'patient-search' | 'patient-care' | 'assigned-patients'>('overview');
  const [previousView, setPreviousView] = useState<'overview' | 'patient-search' | 'assigned-patients'>('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState('assessment');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [wardName, setWardName] = useState<string>('');
  const [wardNumber, setWardNumber] = useState<string>('');

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

  const fetchDepartmentName = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}`);
      if (response.ok) {
        const department: any = await response.json();
        setDepartmentName(department.name);
      }
    } catch (error) {
      console.error('Error fetching department:', error);
    }
  };

  const fetchWardName = async (wardId: string) => {
    try {
      const response = await fetch(`/api/wards/${wardId}`);
      if (response.ok) {
        const ward: any = await response.json();
        setWardName(ward.name);
        setWardNumber(ward.wardNumber);
      }
    } catch (error) {
      console.error('Error fetching ward:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setPreviousView(currentView as 'overview' | 'patient-search' | 'assigned-patients');
    setSelectedPatient(patient);
    setCurrentView('patient-care');
    setActiveWorkflowStep('assessment');
    fetchAssignedPatients(); // Re-fetch assigned patients

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
            {t('nurseDashboard.title')}
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            {t('nurseDashboard.subtitle')}
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
            <h3 className="text-xl font-semibold mb-2">{t('nurseDashboard.searchPatients')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('nurseDashboard.searchPatientsDesc')}
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
            <h3 className="text-xl font-semibold mb-2">{t('nurseDashboard.myPatients')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('nurseDashboard.patientsUnderCare').replace('{count}', assignedPatients.length.toString())}
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
              {t('nurseDashboard.activityFeedComingSoon')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('nurseDashboard.activityFeedComingSoon')}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('nurseDashboard.activityFeedDesc')}
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
        <div className="flex flex-col md:flex-row items-start md:items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-6 md:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('nurseDashboard.patientSearch')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('nurseDashboard.patientSearchDesc')}
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
                placeholder={t('nurseDashboard.searchPlaceholder')}
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
                        <p className="text-sm text-muted-foreground">{t('nurseDashboard.mrn')}: {patient.mrn}</p>
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
              {t('nurseDashboard.noPatientsFound')}
            </h3>
            <p className="text-muted-foreground">
              {t('nurseDashboard.noPatientsFoundDesc')}
            </p>
          </div>
        ) : (
          <div className="col-span-full text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('nurseDashboard.searchForPatients')}
            </h3>
            <p className="text-muted-foreground">
              {t('nurseDashboard.searchForPatientsDesc')}
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
        <div className="flex flex-col md:flex-row items-start md:items-center space-x-4">
          {/* <Link href={"/dashboard/ehr/nurses-dashboard"}> */}
          <Button
            variant="ghost"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-6 md:mb-0"
                        onClick={handleBack}
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('nurseDashboard.backToOverview')}
          </Button>
            {/* </Link> */}
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('nurseDashboard.myPatients')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('nurseDashboard.patientsUnderCare').replace('{count}', assignedPatients.length.toString())}
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
              {t('nurseDashboard.noPatientsAssigned')}
            </h3>
            <p className="text-muted-foreground">
              {t('nurseDashboard.noPatientsAssignedDesc')}
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
              {t('nurseDashboard.underCare')}
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
                {selectedPatient?.mrn && `${t('nurseDashboard.mrn')}: ${selectedPatient.mrn}`}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-2 mb-10">
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
            {t('nurseDashboard.nursingCareWorkflow')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeWorkflowStep} onValueChange={setActiveWorkflowStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-8 h-auto p-1">
              {getNurseWorkflowSteps(t).map((step, index) => (
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
                {t('nurseDashboard.patientAssessment')}
              </h3>
              <p className="text-muted-foreground">
                {t('nurseDashboard.patientAssessmentDesc')}
              </p>
            </div>
                  <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.fullName')}</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                    </div>
                    {selectedPatient.mrn && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.mrn')}</p>
                        <p className="text-gray-900 dark:text-white font-mono">{selectedPatient.mrn}</p>
                      </div>
                    )}
                    {selectedPatient.dob && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.dateOfBirth')}</p>
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
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.email')}</p>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.contact.email}</p>
                      </div>
                    )}
                    {selectedPatient.contact?.phone && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.phone')}</p>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.contact.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Admission Info */}
                    {selectedPatient.admissionType && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.admissionType')}</p>
                        <Badge variant="outline" className="capitalize">
                          {selectedPatient.admissionType}
                        </Badge>
                      </div>
                    )}
                    {selectedPatient.department && departmentName && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.department')}</p>
                        <p className="text-gray-900 dark:text-white">{departmentName}</p>
                      </div>
                    )}
                    {selectedPatient.ward && wardName && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('nurseDashboard.ward')}</p>
                        <p className="text-gray-900 dark:text-white">{wardName} ({wardNumber})</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('nurseDashboard.vitalSignsMonitoring')}
              </h3>
              <p className="text-muted-foreground">
                {t('nurseDashboard.vitalSignsMonitoringDesc')}
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
                {t('nurseDashboard.medicationAdministration')}
              </h3>
              <p className="text-muted-foreground">
                {t('nurseDashboard.medicationAdministrationDesc')}
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
                {t('nurseDashboard.careDocumentation')}
              </h3>
              <p className="text-muted-foreground">
                {t('nurseDashboard.careDocumentationDesc')}
              </p>
            </div>
            <ClinicalNotesDisplay patientId={selectedPatient._id} />
            <HandoffReportsDisplay
              patientId={selectedPatient._id}
              allowedTypes={['patient']}
            />
          </div>
        );

      case 'careplanning':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('nurseDashboard.nursingCarePlanning')}
              </h3>
              <p className="text-muted-foreground">
                {t('nurseDashboard.nursingCarePlanningDesc')}
              </p>
            </div>
            <NursingCarePlanDisplay patientId={selectedPatient._id} nurseId={session?.user?._id || ''} />
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