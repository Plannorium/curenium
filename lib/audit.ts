import AuditLog from "@/models/AuditLog" ; 
 
 export async function writeAudit({ orgId, userId, userRole, action, targetType, targetId, before=null, after=null, meta=null, ip=null  }) { 
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