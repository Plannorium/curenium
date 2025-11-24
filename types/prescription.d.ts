
// /types/prescription.d.ts
export interface Prescription {
  _id: string;
  orgId: string;
  patientId: string;
  prescribedBy: string;
  medication: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  dispensedBy?: string;
  dispensedNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}