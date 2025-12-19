"use client";

import { Patient } from "@/types/patient" ;
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" ;
  import { Badge } from "@/components/ui/badge" ;
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" ;
  import { Cake, VenetianMask, Mail, Phone, FileText, Pill, Calendar, Activity, ClipboardCheck, ShieldCheck, Home, UserSquare, Share2, Stethoscope, Beaker, ArrowUp, ArrowUpRight, ExternalLink, Users, Building, UserCheck, Printer, Download, CheckSquare } from 'lucide-react';
  import Barcode from 'react-barcode';
import DetailItem from "@/app/(dashboard)/components/patients/DetailItem";
import EmptyTabContent from "@/app/(dashboard)/components/patients/EmptyTabContent";
import AppointmentsDisplay from "./AppointmentsDisplay";
import InsuranceDisplay from "./InsuranceDisplay";
import AuditLogDisplay from "./AuditLogDisplay";
import { SharePatientModal } from "./SharePatientModal";
import { TaskList } from "./TaskList";
  import { Button } from "@/components/ui/button";
  import { toast } from "sonner";
  import { motion } from "framer-motion" ;
  import { useState, useEffect, useRef } from "react";
  import { useSession } from "next-auth/react";
  import ClinicalNotesDisplay from "./ClinicalNotesDisplay";
  import Link from "next/link";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import type { IUser as User } from "@/models/User";
  import { useLanguage } from '@/contexts/LanguageContext';
  import { dashboardTranslations } from '@/lib/dashboard-translations';
  import { toPng } from 'html-to-image';
 
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
     const { language } = useLanguage();
     const t = (key: string) => {
       const keys = key.split('.');
       let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
       for (const k of keys) {
         value = value?.[k];
       }
       return value || key;
     };
 
     const [isShareModalOpen, setIsShareModalOpen] = useState(false);
     const [isEditingAssignment, setIsEditingAssignment] = useState(false);
   const [assignmentData, setAssignmentData] = useState({
     assignedNurse: patient.assignedNurse ? (typeof patient.assignedNurse === 'object' && (patient.assignedNurse as any)._id ? (patient.assignedNurse as any)._id : patient.assignedNurse.toString()) : 'unassigned',
     assignedDoctor: patient.assignedDoctor ? (typeof patient.assignedDoctor === 'object' && (patient.assignedDoctor as any)._id ? (patient.assignedDoctor as any)._id : patient.assignedDoctor.toString()) : 'unassigned',
     ward: patient.ward ? (typeof patient.ward === 'object' && (patient.ward as any)._id ? (patient.ward as any)._id : patient.ward.toString()) : '',
     department: patient.department ? (typeof patient.department === 'object' && (patient.department as any)._id ? (patient.department as any)._id : patient.department.toString()) : '',
     roomNumber: patient.roomNumber || '',
     bedNumber: patient.bedNumber || '',
     admissionType: patient.admissionType || 'not-specified',
     careLevel: patient.careLevel || 'not-specified',
     admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : '',
     dischargeDate: patient.dischargeDate ? new Date(patient.dischargeDate).toISOString().split('T')[0] : '',
     isolationStatus: patient.isolationStatus || 'none',
     fallRisk: patient.fallRisk || 'not-assessed',
     mobilityStatus: patient.mobilityStatus || 'not-assessed',
   });
   const [nurses, setNurses] = useState<User[]>([]);
   const [doctors, setDoctors] = useState<User[]>([]);
   const [departments, setDepartments] = useState<any[]>([]);
   const [wards, setWards] = useState<any[]>([]);
   const [isSavingAssignment, setIsSavingAssignment] = useState(false);
   const [selectedWardDetails, setSelectedWardDetails] = useState<any>(null);
   const { data: session } = useSession();
   const barcodeRef = useRef<HTMLDivElement>(null);

   // Fetch departments, wards, nurses and doctors
   useEffect(() => {
     const fetchData = async () => {
       try {
         // Fetch departments and wards
         const [departmentsRes, wardsRes] = await Promise.all([
           fetch('/api/departments'),
           fetch('/api/wards')
         ]);

         if (departmentsRes.ok) {
           const departmentsData = (await departmentsRes.json()) as any[];
           setDepartments(departmentsData);
         }

         if (wardsRes.ok) {
           const wardsData = (await wardsRes.json()) as any[];
           setWards(wardsData);

           // If patient already has a ward assigned, fetch its details
           if (patient.ward) {
             const patientWard = wardsData.find(w => w._id === patient.ward);
             if (patientWard) {
               setSelectedWardDetails(patientWard);
             }
           }
         }

         // Build query parameters based on patient's department and ward
         const nurseParams = new URLSearchParams();
         nurseParams.append('role', 'nurse');
         nurseParams.append('role', 'matron_nurse');
         const doctorParams = new URLSearchParams({ role: 'doctor' });

         const departmentId = patient.department && (typeof patient.department === 'object' && (patient.department as any)._id ? (patient.department as any)._id : patient.department);
         const wardId = patient.ward && (typeof patient.ward === 'object' && (patient.ward as any)._id ? (patient.ward as any)._id : patient.ward);

         // If a ward is selected, filter nurses by ward. Otherwise, filter by department.
         if (wardId) {
           nurseParams.append('ward', wardId.toString());
         } else if (departmentId) {
           nurseParams.append('department', departmentId.toString());
         }

         // Filter doctors by department.
         if (departmentId) {
           doctorParams.append('department', departmentId.toString());
         }

         const [nursesRes, doctorsRes] = await Promise.all([
           fetch(`/api/users?${nurseParams.toString()}`),
           fetch(`/api/users?${doctorParams.toString()}`)
         ]);

         if (nursesRes.ok) {
           const nursesData = await nursesRes.json() as User[];
           setNurses(nursesData);
         }

         if (doctorsRes.ok) {
           const doctorsData = await doctorsRes.json() as User[];
           setDoctors(doctorsData);
         }
       } catch (error) {
         console.error('Failed to fetch data:', error);
       }
     };

     fetchData();
   }, [patient.department, patient.ward]);

   // Fetch staff based on current assignment selections during editing
   useEffect(() => {
     if (!isEditingAssignment) return;

     const fetchStaffForAssignment = async () => {
       try {
         // Build query parameters based on current selections
         const nurseParams = new URLSearchParams();
         nurseParams.append('role', 'nurse');
         nurseParams.append('role', 'matron_nurse');
         const doctorParams = new URLSearchParams({ role: 'doctor' });

         // Filter doctors by selected department
         if (assignmentData.department && assignmentData.department !== '') {
           doctorParams.append('department', assignmentData.department);
         }

         // If a ward is selected, filter nurses by ward. Otherwise, filter by department.
         if (assignmentData.ward && assignmentData.ward !== '' && assignmentData.ward !== 'unassigned') {
           nurseParams.append('ward', assignmentData.ward);
         } else if (assignmentData.department && assignmentData.department !== '' && assignmentData.department !== 'unassigned') {
           nurseParams.append('department', assignmentData.department);
         }

         const [nursesRes, doctorsRes] = await Promise.all([
           fetch(`/api/users?${nurseParams.toString()}`),
           fetch(`/api/users?${doctorParams.toString()}`)
         ]);

         if (nursesRes.ok) {
           const nursesData = await nursesRes.json() as User[];
           setNurses(nursesData);
         }

         if (doctorsRes.ok) {
           const doctorsData = await doctorsRes.json() as User[];
           setDoctors(doctorsData);
         }
       } catch (error) {
         console.error('Failed to fetch staff for assignment:', error);
       }
     };

     fetchStaffForAssignment();
   }, [isEditingAssignment, assignmentData.department, assignmentData.ward]);

   const handleShare = () => {
    setIsShareModalOpen(true);
  };

   const handleSaveAssignment = async () => {
     setIsSavingAssignment(true);
     try {
       const updateData = {
         ...assignmentData,
         assignedNurse: assignmentData.assignedNurse === 'unassigned' ? null : assignmentData.assignedNurse,
         assignedDoctor: assignmentData.assignedDoctor === 'unassigned' ? null : assignmentData.assignedDoctor,
         ward: assignmentData.ward === 'unassigned' ? '' : assignmentData.ward,
         department: assignmentData.department === 'unassigned' ? null : assignmentData.department,
         admissionType: assignmentData.admissionType === 'not-specified' ? '' : assignmentData.admissionType,
         careLevel: assignmentData.careLevel === 'not-specified' ? '' : assignmentData.careLevel,
         fallRisk: assignmentData.fallRisk === 'not-assessed' ? '' : assignmentData.fallRisk,
         mobilityStatus: assignmentData.mobilityStatus === 'not-assessed' ? '' : assignmentData.mobilityStatus,
         roomNumber: assignmentData.roomNumber === 'not-assigned' ? '' : assignmentData.roomNumber || '',
         bedNumber: assignmentData.bedNumber === 'not-assigned' ? '' : assignmentData.bedNumber || '',
         admissionDate: assignmentData.admissionDate ? new Date(assignmentData.admissionDate).toISOString() : null,
         dischargeDate: assignmentData.dischargeDate ? new Date(assignmentData.dischargeDate).toISOString() : null,
       };

       const response = await fetch(`/api/patients/${patient._id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(updateData),
       });

      if (response.ok) {
  // Parse returned patient and update local UI state so changes are visible
  // response.json() is `unknown` in TS, cast to a safe partial Patient shape
  const updated = (await response.json()) as Partial<Patient & Record<string, any>>;

         setAssignmentData(prev => ({
           ...prev,
           assignedNurse: updated.assignedNurse ? (typeof updated.assignedNurse === 'object' && (updated.assignedNurse as any)._id ? (updated.assignedNurse as any)._id : String(updated.assignedNurse)) : 'unassigned',
           assignedDoctor: updated.assignedDoctor ? (typeof updated.assignedDoctor === 'object' && (updated.assignedDoctor as any)._id ? (updated.assignedDoctor as any)._id : String(updated.assignedDoctor)) : 'unassigned',
           ward: updated.ward ? (typeof updated.ward === 'object' && (updated.ward as any)._id ? (updated.ward as any)._id : String(updated.ward)) : '',
           department: updated.department ? (typeof updated.department === 'object' && (updated.department as any)._id ? (updated.department as any)._id : String(updated.department)) : '',
           roomNumber: updated.roomNumber || '',
           bedNumber: updated.bedNumber || '',
           admissionType: updated.admissionType || 'not-specified',
           careLevel: updated.careLevel || 'not-specified',
           admissionDate: updated.admissionDate ? new Date(updated.admissionDate).toISOString().split('T')[0] : '',
           dischargeDate: updated.dischargeDate ? new Date(updated.dischargeDate).toISOString().split('T')[0] : '',
           isolationStatus: updated.isolationStatus || 'none',
           fallRisk: updated.fallRisk || 'not-assessed',
           mobilityStatus: updated.mobilityStatus || 'not-assessed',
         }));

         toast.success('Patient assignment updated successfully');
         setIsEditingAssignment(false);
       } else {
         toast.error('Failed to update patient assignment');
       }
     } catch (error) {
       console.error('Error updating assignment:', error);
       toast.error('An error occurred while updating the assignment');
     } finally {
       setIsSavingAssignment(false);
     }
   };

   const handleDownloadBarcode = async () => {
     if (!barcodeRef.current) return;

     try {
       const dataUrl = await toPng(barcodeRef.current, {
         backgroundColor: '#ffffff',
         quality: 1,
         pixelRatio: 2,
       });

       const link = document.createElement('a');
       link.download = `patient-barcode-${patient.mrn || patient._id}.png`;
       link.href = dataUrl;
       link.click();
     } catch (error) {
       console.error('Failed to download barcode:', error);
       toast.error('Failed to download barcode');
     }
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
            <Button variant="outline" size="icon">
            <Link href={`/dashboard/ehr/patients/${patient._id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
            </Button>
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
         <TabsList className="grid grid-cols-7 lg:gap-x-2 h-fit w-full bg-linear-to-r from-gray-50/80 to-white/60 dark:from-gray-900/60 dark:to-gray-950/40 px-1 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl backdrop-blur-lg overflow-x-auto">
           <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <ClipboardCheck className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.overview')}</span>
           </TabsTrigger>
           <TabsTrigger value="appointments" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <Calendar className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.appointments')}</span>
           </TabsTrigger>
           <TabsTrigger value="insurance" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <ShieldCheck className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.insurance')}</span>
           </TabsTrigger>
           <TabsTrigger value="audit-log" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <FileText className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.auditLog')}</span>
           </TabsTrigger>
           <TabsTrigger value="clinical_notes" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <FileText className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.clinicalNotes')}</span>
           </TabsTrigger>
           <TabsTrigger value="tasks" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <CheckSquare className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">Tasks</span>
           </TabsTrigger>
           <TabsTrigger value="assignment" className="flex items-center justify-center space-x-2 py-2 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-xl transition-all hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
             <UserCheck className="h-4 w-4 shrink-0" />
             <span className="hidden sm:inline">{t('patientDetail.assignment')}</span>
           </TabsTrigger>
           </TabsList>

           {/* Tab Contents */}
           <TabsContent value="overview" className="p-4 sm:p-8 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-b-3xl" >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 text-sm" >
               <DetailItem icon={Cake} label={t('patientDetail.dateOfBirth')} value={patient.dob ? `${new Date(patient.dob).toLocaleDateString()} (${calculateAge(patient.dob)} years old )` : 'N/A'} />
               <DetailItem icon={VenetianMask} label={t('patientDetail.gender')} value={patient.gender || 'N/A'}  />
               <DetailItem icon={Mail} label={t('patientDetail.email')} value={patient.contact?.email || 'N/A'}  />
               <DetailItem icon={Phone} label={t('patientDetail.phone')} value={patient.contact?.phone || 'N/A'}  />
                <DetailItem icon={Home} label={t('patientDetail.address')} value={patient.address ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zip}`: 'N/A'} />
                <DetailItem icon={UserSquare} label={t('patientDetail.emergencyContact')} value={patient.emergencyContact ? `${patient.emergencyContact.name} - ${patient.emergencyContact.phone}`: 'N/A'} />
             </div >

             {/* Care Team Assignment Overview */}
             <Card className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
               <CardHeader>
                 <CardTitle className="flex items-center text-lg">
                   <Users className="h-5 w-5 mr-2 text-blue-500" />
                   Care Team Assignment
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-semibold flex items-center">
                       <Stethoscope className="h-4 w-4 mr-1 text-blue-500" />
                       Assigned Nurse
                     </Label>
                     <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      {assignmentData.assignedNurse && assignmentData.assignedNurse !== 'unassigned' ? (
                         nurses.find(n => String((n as any)?._id) === String(assignmentData.assignedNurse))?.fullName || 'Loading...'
                       ) : (
                         <span className="text-muted-foreground">Not assigned</span>
                       )}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-semibold flex items-center">
                       <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                       Assigned Doctor
                     </Label>
                     <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                       {assignmentData.assignedDoctor && assignmentData.assignedDoctor !== 'unassigned' ? (
                         doctors.find(d => String((d as any)?._id) === String(assignmentData.assignedDoctor))?.fullName || 'Loading...'
                       ) : (
                         <span className="text-muted-foreground">Not assigned</span>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Location Information */}
                 {(assignmentData.ward || assignmentData.department || assignmentData.roomNumber || assignmentData.bedNumber) && (
                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <Label className="text-sm font-semibold flex items-center mb-2">
                       <Building className="h-4 w-4 mr-1 text-purple-500" />
                       Location Details
                     </Label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                       {assignmentData.ward && (
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                           <div className="font-medium text-blue-700 dark:text-blue-300">Ward</div>
                           <div className="text-blue-600 dark:text-blue-400">
                             {wards.find(w => w._id === assignmentData.ward)?.name || assignmentData.ward}
                           </div>
                         </div>
                       )}
                       {assignmentData.department && (
                         <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
                           <div className="font-medium text-green-700 dark:text-green-300">Department</div>
                           <div className="text-green-600 dark:text-green-400">
                             {departments.find(d => d._id === assignmentData.department)?.name || assignmentData.department}
                           </div>
                         </div>
                       )}
                       {assignmentData.roomNumber && (
                         <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">
                           <div className="font-medium text-purple-700 dark:text-purple-300">Room</div>
                           <div className="text-purple-600 dark:text-purple-400">{assignmentData.roomNumber}</div>
                         </div>
                       )}
                       {assignmentData.bedNumber && (
                         <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-center">
                           <div className="font-medium text-orange-700 dark:text-orange-300">Bed</div>
                           <div className="text-orange-600 dark:text-orange-400">{assignmentData.bedNumber}</div>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Patient Barcode */}
             <Card className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
               <CardHeader>
                 <CardTitle className="flex items-center justify-between text-lg">
                   <div className="flex items-center">
                     <Printer className="h-5 w-5 mr-2 text-blue-500" />
                     Patient Barcode
                   </div>
                   <div className="flex space-x-2">
                     <Button
                       onClick={handleDownloadBarcode}
                       variant="outline"
                       size="sm"
                       className="print:hidden"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download
                     </Button>
                     <Button
                       onClick={() => window.print()}
                       variant="outline"
                       size="sm"
                       className="print:hidden"
                     >
                       <Printer className="h-4 w-4 mr-2" />
                       Print
                     </Button>
                   </div>
                 </CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col items-center space-y-4">
                 <div ref={barcodeRef} className="text-center" data-barcode>
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scan this barcode for patient identification</p>
                   <div className="bg-white p-4 rounded-lg border print:border-0 print:bg-transparent">
                     {patient.mrn ? (
                       <Barcode value={patient.mrn} width={2} height={60} fontSize={12} />
                     ) : (
                       <p className="text-gray-500">MRN not available</p>
                     )}
                   </div>
                   <p className="text-xs text-gray-500 mt-2 print:text-black">MRN: {patient.mrn || 'N/A'}</p>
                 </div>
               </CardContent>
               <style jsx>{`
                 @media print {
                   .print\\:hidden { display: none !important; }
                   .print\\:border-0 { border: 0 !important; }
                   .print\\:bg-transparent { background: transparent !important; }
                   .print\\:text-black { color: black !important; }
                 }
               `}</style>
             </Card>
           </TabsContent >

           <TabsContent value="appointments" >
             <AppointmentsDisplay patientId={patient._id || ''} />
           </TabsContent >

           <TabsContent value="insurance" >
             <InsuranceDisplay patientId={patient._id || ''} />
           </TabsContent >
           <TabsContent value="audit-log">
             <AuditLogDisplay patientId={patient._id || ''} />
           </TabsContent>
          <TabsContent value="clinical_notes">
            <ClinicalNotesDisplay patientId={patient._id || ''} />
          </TabsContent>
          <TabsContent value="tasks" className="p-4 sm:p-8 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-b-3xl">
            <TaskList
              patientId={patient._id}
              showAddTask={session?.user?.role?.includes('matron') || session?.user?.role?.includes('admin')}
            />
          </TabsContent>
          <TabsContent value="assignment" className="p-4 sm:p-8 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-b-3xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('patientDetail.careTeamAssignment')}</h3>
                  <p className="text-muted-foreground mt-1">{t('patientDetail.careTeamAssignmentDesc')}</p>
                </div>
                {!isEditingAssignment ? (
                  <Button onClick={() => setIsEditingAssignment(true)} className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserCheck className="h-4 w-4 mr-2" />
                    {t('patientDetail.editAssignment')}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingAssignment(false)}>
                      {t('patientDetail.cancel')}
                    </Button>
                    <Button onClick={handleSaveAssignment} disabled={isSavingAssignment} className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      {isSavingAssignment ? t('patientDetail.saving') : t('patientDetail.saveChanges')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Care Team Assignment */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      {t('patientDetail.careTeam')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedNurse" className="text-sm font-semibold">{t('patientDetail.assignedNurse')}</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.assignedNurse}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, assignedNurse: value }))}
                          disabled={!assignmentData.department || assignmentData.department === 'unassigned'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={assignmentData.department && assignmentData.department !== 'unassigned' ? t('patientDetail.selectNurse') : "Select department first"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {nurses.map((nurse) => (
                              <SelectItem key={String((nurse as any)._id)} value={String((nurse as any)._id)}>
                                {nurse.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          {assignmentData.assignedNurse && assignmentData.assignedNurse !== 'unassigned' ? (
                            nurses.find(n => String((n as any)?._id) === String(assignmentData.assignedNurse))?.fullName || 'Loading...'
                          ) : (
                            <span className="text-muted-foreground">{t('patientDetail.notAssigned')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedDoctor" className="text-sm font-semibold">{t('patientDetail.assignedDoctor')}</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.assignedDoctor}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, assignedDoctor: value }))}
                          disabled={!assignmentData.department || assignmentData.department === 'unassigned'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={assignmentData.department && assignmentData.department !== 'unassigned' ? t('patientDetail.selectDoctor') : "Select department first"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {doctors.map((doctor) => (
                              <SelectItem key={String((doctor as any)._id)} value={String((doctor as any)._id)}>
                                {doctor.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          {assignmentData.assignedDoctor && assignmentData.assignedDoctor !== 'unassigned' ? (
                            doctors.find(d => String((d as any)?._id) === String(assignmentData.assignedDoctor))?.fullName || 'Loading...'
                          ) : (
                            <span className="text-muted-foreground">{t('patientDetail.notAssigned')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Admission */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Building className="h-5 w-5 mr-2 text-green-500" />
                      Location & Admission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ward" className="text-sm font-semibold">Ward</Label>
                        {isEditingAssignment ? (
                          <Select
                            value={assignmentData.ward}
                            onValueChange={async (value) => {
                              // Fetch ward details to get totalBeds for bed number options
                              if (value && value !== 'unassigned') {
                                try {
                                  const wardResponse = await fetch(`/api/wards/${value}`);
                                  if (wardResponse.ok) {
                                    const wardDetails = await wardResponse.json();
                                    setSelectedWardDetails(wardDetails);
                                  }
                                } catch (error) {
                                  console.error('Failed to fetch ward details:', error);
                                }
                              } else {
                                setSelectedWardDetails(null);
                              }

                              setAssignmentData(prev => ({
                                ...prev,
                                ward: value,
                                assignedNurse: 'unassigned', // Clear nurse when ward changes
                                bedNumber: '', // Clear bed when ward changes
                                roomNumber: '' // Clear room when ward changes
                              }));
                            }}
                            disabled={!assignmentData.department || assignmentData.department === 'unassigned'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={assignmentData.department && assignmentData.department !== 'unassigned' ? "Select ward" : "Select department first"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Not assigned</SelectItem>
                              {wards
                                .filter(ward => !assignmentData.department || assignmentData.department === 'unassigned' || ward.department?._id === assignmentData.department)
                                .map((ward) => (
                                  <SelectItem key={ward._id} value={ward._id}>
                                    {ward.name} ({ward.wardNumber})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.ward ? (
                              wards.find(w => w._id === assignmentData.ward)?.name || assignmentData.ward
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
                        {isEditingAssignment ? (
                          <Select
                            value={assignmentData.department}
                            onValueChange={(value) => setAssignmentData(prev => ({
                              ...prev,
                              department: value,
                              ward: 'unassigned', // Clear ward when department changes
                              assignedDoctor: 'unassigned', // Clear doctor when department changes
                              assignedNurse: 'unassigned' // Clear nurse when department changes
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Not assigned</SelectItem>
                              {departments.map((dept) => (
                                <SelectItem key={dept._id} value={dept._id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.department ? (
                              departments.find(d => d._id === assignmentData.department)?.name || assignmentData.department
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roomNumber" className="text-sm font-semibold">Room</Label>
                        {isEditingAssignment ? (
                          <Select
                            value={assignmentData.roomNumber}
                            onValueChange={(value) => setAssignmentData(prev => ({ ...prev, roomNumber: value }))}
                            disabled={!assignmentData.ward || assignmentData.ward === 'unassigned'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={assignmentData.ward && assignmentData.ward !== 'unassigned' ? "Select room" : "Select ward first"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-48 overflow-y-auto">
                              <SelectItem value="not-assigned">{t('patientDetail.notAssigned')}</SelectItem>
                              {/* Generate room options based on ward's totalRooms */}
                              {selectedWardDetails && selectedWardDetails.totalRooms && Array.from({ length: selectedWardDetails.totalRooms }, (_, i) => (
                                <SelectItem key={`room-${i + 1}`} value={`Room ${i + 1}`}>
                                  Room {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.roomNumber || <span className="text-muted-foreground">Not assigned</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bedNumber" className="text-sm font-semibold">Bed</Label>
                        {isEditingAssignment ? (
                          <Select
                            value={assignmentData.bedNumber}
                            onValueChange={(value) => setAssignmentData(prev => ({ ...prev, bedNumber: value }))}
                            disabled={!assignmentData.ward || assignmentData.ward === 'unassigned'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={assignmentData.ward && assignmentData.ward !== 'unassigned' ? "Select bed" : "Select ward first"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-48 overflow-y-auto">
                              <SelectItem value="not-assigned">{t('patientDetail.notAssigned')}</SelectItem>
                              {/* Generate bed options based on ward's totalBeds */}
                              {selectedWardDetails && Array.from({ length: selectedWardDetails.totalBeds }, (_, i) => (
                                <SelectItem key={`bed-${i + 1}`} value={`Bed ${i + 1}`}>
                                  Bed {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.bedNumber || <span className="text-muted-foreground">Not assigned</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admission Details */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                      Admission Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admissionType" className="text-sm font-semibold">Admission Type</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.admissionType}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, admissionType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select admission type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-specified">Not specified</SelectItem>
                            <SelectItem value="inpatient">Inpatient</SelectItem>
                            <SelectItem value="outpatient">Outpatient</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="day-surgery">Day Surgery</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg capitalize">
                          {assignmentData.admissionType && assignmentData.admissionType !== 'not-specified' ? assignmentData.admissionType : <span className="text-muted-foreground">Not specified</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="careLevel" className="text-sm font-semibold">Care Level</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.careLevel}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, careLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select care level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-specified">Not specified</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg capitalize">
                          {assignmentData.careLevel && assignmentData.careLevel !== 'not-specified' ? assignmentData.careLevel : <span className="text-muted-foreground">Not specified</span>}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admissionDate" className="text-sm font-semibold">Admission Date</Label>
                        {isEditingAssignment ? (
                          <Input
                            id="admissionDate"
                            type="date"
                            value={assignmentData.admissionDate}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, admissionDate: e.target.value }))}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.admissionDate ? new Date(assignmentData.admissionDate).toLocaleDateString() : <span className="text-muted-foreground">Not set</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dischargeDate" className="text-sm font-semibold">Discharge Date</Label>
                        {isEditingAssignment ? (
                          <Input
                            id="dischargeDate"
                            type="date"
                            value={assignmentData.dischargeDate}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, dischargeDate: e.target.value }))}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            {assignmentData.dischargeDate ? new Date(assignmentData.dischargeDate).toLocaleDateString() : <span className="text-muted-foreground">Not set</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Safety & Mobility */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <ShieldCheck className="h-5 w-5 mr-2 text-orange-500" />
                      Safety & Mobility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="isolationStatus" className="text-sm font-semibold">Isolation Status</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.isolationStatus}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, isolationStatus: value as "none" | "contact" | "droplet" | "airborne" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select isolation status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="droplet">Droplet</SelectItem>
                            <SelectItem value="airborne">Airborne</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg capitalize">
                          {assignmentData.isolationStatus || <span className="text-muted-foreground">None</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fallRisk" className="text-sm font-semibold">Fall Risk</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.fallRisk}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, fallRisk: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fall risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-assessed">Not assessed</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg capitalize">
                          {assignmentData.fallRisk && assignmentData.fallRisk !== 'not-assessed' ? assignmentData.fallRisk : <span className="text-muted-foreground">Not assessed</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobilityStatus" className="text-sm font-semibold">Mobility Status</Label>
                      {isEditingAssignment ? (
                        <Select
                          value={assignmentData.mobilityStatus}
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, mobilityStatus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mobility status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-assessed">Not assessed</SelectItem>
                            <SelectItem value="independent">Independent</SelectItem>
                            <SelectItem value="assisted">Assisted</SelectItem>
                            <SelectItem value="wheelchair">Wheelchair</SelectItem>
                            <SelectItem value="bedridden">Bedridden</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg capitalize">
                          {assignmentData.mobilityStatus && assignmentData.mobilityStatus !== 'not-assessed' ? assignmentData.mobilityStatus : <span className="text-muted-foreground">Not assessed</span>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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