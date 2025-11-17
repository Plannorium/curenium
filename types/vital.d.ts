export interface Vital {
  _id: string;
  orgId: string;
  patientId: string;
  recordedAt: Date;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  notes?: string;
  isUrgent?: boolean;
  createdAt: Date;
  updatedAt: Date;
  height?: number;
  weight?: number;
}