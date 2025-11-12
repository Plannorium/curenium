import { LucideIcon } from "lucide-react" ; 
 
 interface DetailItemProps  { 
   icon: LucideIcon ; 
   label: string ; 
   value: string | number | null ; 
 } 
 
 export default function DetailItem({ icon: Icon, label, value }: DetailItemProps ) { 
   return  ( 
     <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300" > 
       <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary" > 
         <Icon className="w-5 h-5"  /> 
       </div > 
       <div className="flex flex-col" > 
         <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">{label}</p > 
         <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value || "—"}</p > 
       </div > 
     </div > 
   ); 
 }