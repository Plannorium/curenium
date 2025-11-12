import AuditLog from "@/models/AuditLog" ; 
 
 export function auditPlugin(schema: any, options: { targetType?: string  } = {}) { 
   const targetType = options.targetType || schema.options.collection || "Unknown" ; 
 
   // on create 
   schema.post("save", async function(doc: any ) { 
     // if isNew then create event else update event will also trigger save; we detect 
     const action = doc.__wasNew ? `${targetType.toLowerCase()}.create` : `${targetType.toLowerCase()} .update`; 
     const after = doc.toObject ? doc.toObject () : doc; 
     try  { 
       await AuditLog.create ({ 
         orgId: doc.orgId , 
         userId: doc._auditUser || null , 
         userRole: doc._auditUserRole || null , 
         action, 
         targetType, 
         targetId: doc._id , 
         before: doc._auditBefore || null , 
         after, 
         meta: doc._auditMeta || null 
       }); 
     } catch  (e) { 
       console.error("audit save failed" , e); 
     } 
   }); 
 
   // capture if document is a new document 
   schema.pre("save", function(next: any ) { 
     (this as any).__wasNew = this.isNew ; 
     next (); 
   }); 
 
   // on remove / deleteOne 
   schema.pre("remove", async function(next: any ) { 
     const doc = this as any ; 
     try  { 
       await AuditLog.create ({ 
         orgId: doc.orgId , 
         userId: doc._auditUser || null , 
         userRole: doc._auditUserRole || null , 
         action: `${targetType.toLowerCase()} .delete`, 
         targetType, 
         targetId: doc._id , 
         before: doc.toObject ? doc.toObject() : null , 
         after: null , 
         meta: doc._auditMeta || null 
       }); 
     } catch (e) { console.error("audit remove failed" , e); } 
     next (); 
   }); 
 
   // helper to attach audit context from code: 
   schema.methods._setAuditContext = function(userId: any, userRole: string, before?: any, meta?: any ) { 
     this._auditUser  = userId; 
     this._auditUserRole  = userRole; 
     this._auditBefore = before || null ; 
     this._auditMeta = meta || null ; 
   }; 
 }