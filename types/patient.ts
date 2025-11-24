export interface Patient {
    _id?: string;
    orgId: string;
    mrn?: string;
    firstName: string;
    lastName: string;
    fullName?: string;
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
   // Nursing-specific fields
   admissionType?: "inpatient" | "outpatient" | "emergency" | "day-surgery";
   ward?: string;
   department?: string;
   roomNumber?: string;
   bedNumber?: string;
   assignedNurse?: string; // Nurse ID
   assignedDoctor?: string; // Doctor ID
   admissionDate?: string;
   dischargeDate?: string;
   careLevel?: "critical" | "intermediate" | "basic";
   isolationStatus?: "none" | "contact" | "droplet" | "airborne";
   fallRisk?: "low" | "medium" | "high";
   mobilityStatus?: "independent" | "assisted" | "wheelchair" | "bedridden";
  }