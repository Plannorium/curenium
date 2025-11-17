import mongoose, { Schema, Document } from 'mongoose';

export interface IInsurance extends Document {
  patientId: Schema.Types.ObjectId;
  orgId: Schema.Types.ObjectId;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDob: Date;
  relationshipToPatient: string;
}

const InsuranceSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  provider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  groupNumber: { type: String },
  subscriberName: { type: String, required: true },
  subscriberDob: { type: Date, required: true },
  relationshipToPatient: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Insurance || mongoose.model<IInsurance>('Insurance', InsuranceSchema);