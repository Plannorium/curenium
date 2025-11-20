import AuditLog from "@/models/AuditLog" ; 
 
 export async function writeAudit({ orgId, userId, userRole, action, targetType, targetId, before=null, after=null, meta, ip=null  }: { orgId: string, userId: string, userRole: string, action: string, targetType: string, targetId: string | null, before?: any, after?: any, meta?: any, ip?: string | null }) {
   try  { 
     await AuditLog.create ({ 
       orgId, 
       userId, 
       userRole, 
       action, 
       targetType, 
       targetId, 
       before, 
       after, 
       meta, 
       ip 
     }); 
   } catch  (e) { 
     console.error("writeAudit error" , e); 
   } 
 }