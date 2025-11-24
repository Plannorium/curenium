
import { Types } from 'mongoose';

export interface SOAPNote {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  author: Types.ObjectId;
  authorRole: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  encounterId?: Types.ObjectId;
  signedAt?: Date;
  signedBy?: Types.ObjectId;
  visibility: "private"|"team"|"public";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsentForm {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  formType: string;
  version: string;
  data: object;
  signedBy: Types.ObjectId;
  signedAt: Date;
  signedVia: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DischargeSummary {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  author: Types.ObjectId;
  admissionDate: Date;
  dischargeDate: Date;
  summaryText: string;
  followUp: string;
  signedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NursingNote {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  author: Types.ObjectId;
  shift: string;
  content: string;
  attachments?: string[];
  signed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Section {
  title: string;
  fields: string[];
}

export interface CarePlanTemplate {
  _id?: string;
  orgId: Types.ObjectId;
  slug: string;
  title: string;
  sections: Section[];
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Allergy {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  notedBy: Types.ObjectId;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Problem {
  title: string;
  icdCode?: string;
  status: 'active' | 'resolved' | 'chronic';
  notedBy: Types.ObjectId;
  notedAt: Date;
}

export interface ProblemList {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  problems: Problem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicationHistoryEntry {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  start: Date;
  end?: Date;
  status: 'active' | 'inactive' | 'discontinued';
  prescribedBy: string;
}

export interface MedicationHistory {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  entries: MedicationHistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Diagnosis {
  _id?: string;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  diagnosisCode: string;
  description: string;
  severity: string;
  onsetDate: Date;
  resolvedDate?: Date;
  documentedBy: Types.ObjectId;
  documentedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}