
// /types/vital.d.ts
export interface Vital {
  _id: string;
  patientId: string;
  recordedAt: Date;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}