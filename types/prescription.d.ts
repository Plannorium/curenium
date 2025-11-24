
// /types/prescription.d.ts
export interface AdministrationRecord {
  _id: string;
  administeredBy: string;
  administeredAt: Date;
  doseAdministered?: string;
  notes?: string;
  status: 'administered' | 'missed' | 'patient_refused' | 'not_available';
}

export interface Prescription {
  _id: string;
  orgId: string;
  patientId: any;
  prescribedBy: string;
  medications?: string[];
  medication?: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays?: number;
  startDate?: Date;
  endDate?: Date;
  refills?: number;
  instructions?: string;
  reasonForPrescription?: string;
  status: 'active' | 'completed' | 'cancelled';
  statusReason?: string;
  notes?: string;
  dispensedBy?: string;
  dispensedNotes?: string;
  administrations?: AdministrationRecord[];
  createdAt: Date;
  updatedAt: Date;
}