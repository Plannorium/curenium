export interface Patient { 
   _id?: string; 
   orgId: string; 
   mrn?: string; 
   firstName: string; 
   lastName: string; 
   dob?: string; 
   gender?: "male" | "female" | "other"; 
   contact: { 
     phone?: string; 
     email?: string; 
   }; 
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
   primaryPhysician?: string; 
   metadata?: any; 
   deleted?: boolean; 
   createdAt: string; 
   updatedAt: string; 
   avatarUrl?: string;
   status?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
  };
 }