import { LucideProps } from "lucide-react" ; 
 import { motion } from "framer-motion" ; 
 
 interface EmptyTabContentProps  { 
   icon: React.ForwardRefExoticComponent < 
     Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement > 
   >; 
   text: string ; 
 } 
 
 export default function EmptyTabContent({ icon: Icon, text }: EmptyTabContentProps ) { 
   return  ( 
     <motion.div 
       initial={{ opacity: 0  }} 
       animate={{ opacity: 1  }} 
       className="p-16 text-center bg-transparent dark:bg-transparent" 
     > 
       <div className="flex flex-col items-center justify-center space-y-6" > 
         <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-inner" > 
           <Icon className="w-10 h-10 text-gray-400 dark:text-gray-600"  /> 
         </div > 
         <p className="text-base text-gray-500 dark:text-gray-400 max-w-xs mx-auto" > 
           {text} 
         </p > 
       </div > 
     </motion.div > 
   ); 
 }