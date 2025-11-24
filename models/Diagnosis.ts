
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IUser } from './User';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';

export interface IDiagnosis extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  diagnosisCode: string;
  description: string;
  severity: string;
  onsetDate: Date;
  resolvedDate?: Date;
  documentedBy: IUser['_id'];
  documentedAt: Date;
}

const DiagnosisSchema = new Schema<IDiagnosis>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  diagnosisCode: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  onsetDate: { type: Date, required: true },
  resolvedDate: { type: Date },
  documentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentedAt: { type: Date, default: Date.now },
}, { timestamps: true });

DiagnosisSchema.plugin(auditPlugin);

DiagnosisSchema.index({ orgId: 1, patientId: 1, createdAt: 1 });

const Diagnosis: Model<IDiagnosis> = models.Diagnosis || mongoose.model<IDiagnosis>('Diagnosis', DiagnosisSchema);

export default Diagnosis;