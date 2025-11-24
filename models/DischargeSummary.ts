
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';
import { IUser } from './User';

export interface IDischargeSummary extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  author: IUser['_id'];
  admissionDate: Date;
  dischargeDate: Date;
  summaryText: string;
  followUp: string;
  signedBy?: IUser['_id'];
}

const DischargeSummarySchema = new Schema<IDischargeSummary>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  admissionDate: { type: Date, required: true },
  dischargeDate: { type: Date, required: true },
  summaryText: { type: String, required: true },
  followUp: { type: String, required: true },
  signedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

DischargeSummarySchema.plugin(auditPlugin);

DischargeSummarySchema.index({ orgId: 1, patientId: 1, dischargeDate: 1 });

const DischargeSummary: Model<IDischargeSummary> = models.DischargeSummary || mongoose.model<IDischargeSummary>('DischargeSummary', DischargeSummarySchema);

export default DischargeSummary;