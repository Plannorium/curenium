"use client";

import { Patient } from "@/types/patient" ;
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" ; 
 import { Badge } from "@/components/ui/badge" ; 
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" ; 
 import { Cake, VenetianMask, Mail, Phone, FileText, Pill, Calendar, Activity, ClipboardCheck, ShieldCheck, Home, UserSquare, Share2, Stethoscope, Beaker } from 'lucide-react'; 
import DetailItem from "@/app/(dashboard)/components/patients/DetailItem";
import EmptyTabContent from "@/app/(dashboard)/components/patients/EmptyTabContent";
import VitalsDisplay from "./VitalsDisplay";
import PrescriptionsDisplay from "./PrescriptionsDisplay";
import AppointmentsDisplay from "./AppointmentsDisplay";
import InsuranceDisplay from "./InsuranceDisplay";
import AuditLogDisplay from "./AuditLogDisplay";
import NursingCarePlan from "./NursingCarePlan";
import LabResultsDisplay from "./LabResultsDisplay";
import { SharePatientModal } from "./SharePatientModal";
  import { Button } from "@/components/ui/button";
  import { toast } from "sonner";
  import { motion } from "framer-motion" ;
  import { useState } from "react";
  import { useSession } from "next-auth/react";
import ClinicalNotesDisplay from "./ClinicalNotesDisplay";
import LabOrdersDisplay from "./LabOrdersDisplay";
 
 interface PatientDetailProps  { 
   patient: Patient ; 
 } 
 
 const calculateAge = (dob: string ) => { 
   const birthDate = new Date (dob); 
   const today = new Date (); 
   let age = today.getFullYear() - birthDate.getFullYear (); 
   const m = today.getMonth() - birthDate.getMonth (); 
   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate ())) age--; 
   return  age; 
 }; 
 
 export default function PatientDetail({ patient }: PatientDetailProps ) {
   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
   const { data: session } = useSession();

   const handleShare = () => {
    setIsShareModalOpen(true);
  };

   return  ( 
     <motion.div 
       initial={{ opacity: 0, y: 10  }} 
       animate={{ opacity: 1, y: 0  }} 
       className="w-full backdrop-blur-xl bg-white/70 dark:bg-gray-950/60 shadow-2xl rounded-3xl border border-white/20 dark:border-gray-800 overflow-hidden transition-all lg:max-w-4xl xl:max-w-5xl" 
     > 
       {/* Header */} 
       <div className="relative bg-linear-to-tr from-primary/10 via-white/60 to-transparent dark:from-primary/20 dark:via-gray-900 p-4 sm:p-8 border-b border-white/20 dark:border-gray-800" > 
         <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6" > 
           <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white dark:border-gray-800 shadow-lg" > 
             <AvatarImage src={patient.avatarUrl || ''} alt={`${patient.firstName} ${patient.lastName }`} /> 
             <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-white" > 
               {patient.firstName[0]}{patient.lastName[0]} 
             </AvatarFallback > 
           </Avatar > 
           <div className="flex-1" > 
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight" > 
               {patient.firstName} {patient.lastName} 
             </h1 > 
             <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1" > 
               MRN:{" "} 
               <span className="font-mono bg-white/50 dark:bg-gray-800/70 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700" > 
                 {patient.mrn} 
               </span > 
             </p > 
           </div > 
           <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
           <Badge 
             variant="outline" 
             className={`text-sm sm:text-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 shadow-sm self-start sm:self-center ${ 
               patient.status === 'Active' 
                 ? 'border-green-500 text-green-600 bg-green-100/60 dark:bg-green-900/30 ' 
                 : 'border-gray-400 text-gray-600 bg-gray-100/50 dark:bg-gray-800/40 ' 
             }`} 
           > 
             {patient.status || 'Active'} 
           </Badge > 
           </div>
         </div > 
       </div > 
 
       {/* Tabs */} 
       <div className="p-0">
         <Tabs defaultValue="overview" className="w-full">
         <TabsList className="grid grid-cols-5 lg:gap-x-2 h-fit w-full bg-linear-to-r from-gray-50/80 to-white/60 dark:from-gray-900/60 dark:to-gray-950/40 px-1 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl backdrop-blur-lg overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Activity className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Vitals</span>
            </TabsTrigger>
            <TabsTrigger value="lab-results" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Beaker className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Lab Results</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Pill className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Prescriptions</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="nursing-care-plan" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Stethoscope className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Nursing Care</span>
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Insurance</span>
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Audit Log</span>
            </TabsTrigger>
            <TabsTrigger value="clinical_notes" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Clinical Notes</span>
            </TabsTrigger>
            <TabsTrigger value="lab_orders" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Beaker className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Lab Orders</span>
            </TabsTrigger>
            </TabsList>

           {/* Tab Contents */} 
           <TabsContent value="overview" className="p-4 sm:p-8 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-b-3xl" > 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 text-sm" > 
               <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? `${new Date(patient.dob).toLocaleDateString()} (${calculateAge(patient.dob)} years old )` : 'N/A'} />
               <DetailItem icon={VenetianMask} label="Gender" value={patient.gender || 'N/A'}  />
               <DetailItem icon={Mail} label="Email" value={patient.contact?.email || 'N/A'}  />
               <DetailItem icon={Phone} label="Phone" value={patient.contact?.phone || 'N/A'}  />
                <DetailItem icon={Home} label="Address" value={patient.address ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zip}`: 'N/A'} />
                <DetailItem icon={UserSquare} label="Emergency Contact" value={patient.emergencyContact ? `${patient.emergencyContact.name} - ${patient.emergencyContact.phone}`: 'N/A'} />
             </div >
           </TabsContent >

           <TabsContent value="vitals" >
             <VitalsDisplay patientId={patient._id || ''} />
           </TabsContent >

           <TabsContent value="lab-results">
             <LabResultsDisplay patientId={patient._id || ''} />
           </TabsContent>

           <TabsContent value="prescriptions" >
             <PrescriptionsDisplay patientId={patient._id || ''} />
           </TabsContent >

           <TabsContent value="appointments" >
             <AppointmentsDisplay patientId={patient._id || ''} />
           </TabsContent >

           <TabsContent value="nursing-care-plan">
             <NursingCarePlan patientId={patient._id || ''} nurseId={session?.user?.id || ''} />
           </TabsContent>

           <TabsContent value="insurance" >
             <InsuranceDisplay patientId={patient._id || ''} />
           </TabsContent >
           <TabsContent value="audit-log">
             <AuditLogDisplay patientId={patient._id || ''} />
           </TabsContent>
          <TabsContent value="clinical_notes">
            <ClinicalNotesDisplay patientId={patient._id || ''} />
          </TabsContent>
          <TabsContent value="lab_orders">
            <LabOrdersDisplay patientId={patient._id || ''} />
          </TabsContent>
         </Tabs >
       </div >
       <SharePatientModal
         patientId={patient._id || ''}
         patientName={`${patient.firstName} ${patient.lastName}`}
         isOpen={isShareModalOpen}
         onClose={() => setIsShareModalOpen(false)}
       />
     </motion.div >
   );
 }