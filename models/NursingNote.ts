
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';
import { IUser } from './User';

export interface INursingNote extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  author: IUser['_id'];
  shift: string;
  content: string;
  attachments?: string[];
  signed: boolean;
}

const NursingNoteSchema = new Schema<INursingNote>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shift: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  signed: { type: Boolean, default: false },
}, { timestamps: true });

NursingNoteSchema.plugin(auditPlugin);

NursingNoteSchema.index({ orgId: 1, patientId: 1, createdAt: 1 });

const NursingNote: Model<INursingNote> = models.NursingNote || mongoose.model<INursingNote>('NursingNote', NursingNoteSchema);

export default NursingNote;