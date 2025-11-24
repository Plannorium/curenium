
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IUser } from './User';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';

export interface ISOAPNote extends Document {
  _id: string;
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  author: IUser['_id'];
  authorRole: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  encounterId?: Schema.Types.ObjectId;
  signedAt?: Date;
  signedBy?: IUser['_id'];
  visibility: "private"|"team"|"public";
  createdAt: string;
}

const SOAPNoteSchema = new Schema<ISOAPNote>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, required: true },
  subjective: { type: String, required: true },
  objective: { type: String, required: true },
  assessment: { type: String, required: true },
  plan: { type: String, required: true },
  encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
  signedAt: { type: Date },
  signedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['private', 'team', 'public'], default: 'team' },
}, { timestamps: true });

SOAPNoteSchema.plugin(auditPlugin);

SOAPNoteSchema.index({ orgId: 1, patientId: 1, createdAt: 1 });

const SOAPNote: Model<ISOAPNote> = models.SOAPNote || mongoose.model<ISOAPNote>('SOAPNote', SOAPNoteSchema);

export default SOAPNote;