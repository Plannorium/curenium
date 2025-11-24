
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';

interface IMedicationHistoryEntry {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  start: Date;
  end?: Date;
  status: 'active' | 'inactive' | 'discontinued';
  prescribedBy: string;
}

export interface IMedicationHistory extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  entries: IMedicationHistoryEntry[];
}

const MedicationHistoryEntrySchema = new Schema<IMedicationHistoryEntry>({
  medication: { type: String, required: true },
  dose: { type: String, required: true },
  route: { type: String, required: true },
  frequency: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'discontinued'], required: true },
  prescribedBy: { type: String, required: true },
});

const MedicationHistorySchema = new Schema<IMedicationHistory>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
  entries: [MedicationHistoryEntrySchema],
}, { timestamps: true });

MedicationHistorySchema.plugin(auditPlugin);

MedicationHistorySchema.index({ orgId: 1, patientId: 1 });

const MedicationHistory: Model<IMedicationHistory> = models.MedicationHistory || mongoose.model<IMedicationHistory>('MedicationHistory', MedicationHistorySchema);

export default MedicationHistory;