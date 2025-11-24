
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';
import { IUser } from './User';

export interface IAllergy extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  notedBy: IUser['_id'];
  verified: boolean;
}

const AllergySchema = new Schema<IAllergy>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  substance: { type: String, required: true },
  reaction: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
  notedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

AllergySchema.plugin(auditPlugin);

AllergySchema.index({ orgId: 1, patientId: 1, createdAt: 1 });

const Allergy: Model<IAllergy> = models.Allergy || mongoose.model<IAllergy>('Allergy', AllergySchema);

export default Allergy;