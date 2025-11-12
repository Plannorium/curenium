import { Patient } from "@/types/patient" ; 
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" ; 
 import { Badge } from "@/components/ui/badge" ; 
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" ; 
 import { Cake, VenetianMask, Mail, Phone, FileText, Pill, Calendar, Activity, ClipboardCheck, ShieldCheck, Home, UserSquare } from 'lucide-react'; 
import DetailItem from "@/app/(dashboard)/components/patients/DetailItem";
import EmptyTabContent from "@/app/(dashboard)/components/patients/EmptyTabContent";
 import { motion } from "framer-motion" ; 
 
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
   return  ( 
     <motion.div 
       initial={{ opacity: 0, y: 10  }} 
       animate={{ opacity: 1, y: 0  }} 
       className="w-full backdrop-blur-xl bg-white/70 dark:bg-gray-950/60 shadow-2xl rounded-3xl border border-white/20 dark:border-gray-800 overflow-hidden transition-all" 
     > 
       {/* Header */} 
       <div className="relative bg-gradient-to-tr from-primary/10 via-white/60 to-transparent dark:from-primary/20 dark:via-gray-900 p-8 border-b border-white/20 dark:border-gray-800" > 
         <div className="flex items-center space-x-6" > 
           <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg" > 
             <AvatarImage src={patient.avatarUrl || ''} alt={`${patient.firstName} ${patient.lastName }`} /> 
             <AvatarFallback className="text-3xl bg-primary text-white" > 
               {patient.firstName[0]}{patient.lastName[0]} 
             </AvatarFallback > 
           </Avatar > 
           <div className="flex-1" > 
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight" > 
               {patient.firstName} {patient.lastName} 
             </h1 > 
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" > 
               MRN:{" "} 
               <span className="font-mono bg-white/50 dark:bg-gray-800/70 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700" > 
                 {patient.mrn} 
               </span > 
             </p > 
           </div > 
           <Badge 
             variant="outline" 
             className={`text-md px-4 py-2 rounded-full border-2 shadow-sm  ${ 
               patient.status === 'Active' 
                 ? 'border-green-500 text-green-600 bg-green-100/60 dark:bg-green-900/30 ' 
                 : 'border-gray-400 text-gray-600 bg-gray-100/50 dark:bg-gray-800/40 ' 
             }`} 
           > 
             {patient.status || 'Active'} 
           </Badge > 
         </div > 
       </div > 
 
       {/* Tabs */} 
       <div className="p-0" > 
         <Tabs defaultValue="overview" className="w-full" > 
           <TabsList className="flex flex-wrap justify-between w-full bg-gradient-to-r from-gray-50/80 to-white/60 dark:from-gray-900/60 dark:to-gray-950/40 px-6 py-3 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl backdrop-blur-lg" > 
             <TabsTrigger value="overview" className="flex items-center space-x-2 py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl transition-all data-[state=active]:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900/50" > 
               <ClipboardCheck className="h-4 w-4" /> <span>Overview</span > 
             </TabsTrigger > 
             <TabsTrigger value="vitals" className="flex items-center space-x-2 py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl transition-all data-[state=active]:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900/50" > 
               <Activity className="h-4 w-4" /> <span>Vitals</span > 
             </TabsTrigger > 
             <TabsTrigger value="prescriptions" className="flex items-center space-x-2 py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl transition-all data-[state=active]:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900/50" > 
               <Pill className="h-4 w-4" /> <span>Prescriptions</span > 
             </TabsTrigger > 
             <TabsTrigger value="appointments" className="flex items-center space-x-2 py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl transition-all data-[state=active]:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900/50" > 
               <Calendar className="h-4 w-4" /> <span>Appointments</span > 
             </TabsTrigger > 
             <TabsTrigger value="insurance" className="flex items-center space-x-2 py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl transition-all data-[state=active]:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900/50" >
                <ShieldCheck className="h-4 w-4" /> <span>Insurance</span>
              </TabsTrigger> 
           </TabsList> 

           {/* Tab Contents */} 
           <TabsContent value="overview" className="p-8 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-b-3xl" > 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm" > 
               <DetailItem icon={Cake} label="Date of Birth" value={`${new Date(patient.dob).toLocaleDateString()} (${calculateAge(patient.dob)} years old )`} /> 
               <DetailItem icon={VenetianMask} label="Gender" value={patient.gender}  /> 
               <DetailItem icon={Mail} label="Email" value={patient.contact.email}  /> 
               <DetailItem icon={Phone} label="Phone" value={patient.contact.phone}  /> 
                <DetailItem icon={Home} label="Address" value={patient.address ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zip}`: 'N/A'} />
                <DetailItem icon={UserSquare} label="Emergency Contact" value={patient.emergencyContact ? `${patient.emergencyContact.name} - ${patient.emergencyContact.phone}`: 'N/A'} />
             </div >
           </TabsContent >

           <TabsContent value="vitals" >
             <EmptyTabContent icon={FileText} text="Vitals information will be displayed here."  />
           </TabsContent >

           <TabsContent value="prescriptions" >
             <EmptyTabContent icon={Pill} text="No prescriptions found for this patient." />
           </TabsContent >

           <TabsContent value="appointments" >
             <EmptyTabContent icon={Calendar} text="No upcoming appointments." />
           </TabsContent >

           <TabsContent value="insurance" >
             {patient.insurance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm p-8">
                    <DetailItem icon={ShieldCheck} label="Provider" value={patient.insurance.provider} />
                    <DetailItem icon={FileText} label="Policy Number" value={patient.insurance.policyNumber} />
                </div>
             ) : (
                <EmptyTabContent icon={ShieldCheck} text="No insurance information available." />
             )}
           </TabsContent > 
         </Tabs > 
       </div > 
     </motion.div > 
   ); 
 }