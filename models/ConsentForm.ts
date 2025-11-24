
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';
import { IUser } from './User';

export interface IConsentForm extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  formType: string;
  version: string;
  data: object;
  signedBy: IUser['_id'];
  signedAt: Date;
  signedVia: string;
}

const ConsentFormSchema = new Schema<IConsentForm>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  formType: { type: String, required: true },
  version: { type: String, required: true },
  data: { type: Object, required: true },
  signedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  signedAt: { type: Date, required: true },
  signedVia: { type: String, required: true }, // e.g., 'in-person', 'e-signature'
}, { timestamps: true });

ConsentFormSchema.plugin(auditPlugin);

ConsentFormSchema.index({ orgId: 1, patientId: 1, formType: 1 });

const ConsentForm: Model<IConsentForm> = models.ConsentForm || mongoose.model<IConsentForm>('ConsentForm', ConsentFormSchema);

export default ConsentForm;