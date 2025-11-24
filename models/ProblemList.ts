
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IPatient } from './Patient';
import { IUser } from './User';

interface IProblem {
  title: string;
  icdCode?: string;
  status: 'active' | 'resolved' | 'chronic';
  notedBy: IUser['_id'];
  notedAt: Date;
}

export interface IProblemList extends Document {
  orgId: IOrganization['_id'];
  patientId: IPatient['_id'];
  problems: IProblem[];
}

const ProblemSchema = new Schema<IProblem>({
  title: { type: String, required: true },
  icdCode: { type: String },
  status: { type: String, enum: ['active', 'resolved', 'chronic'], required: true },
  notedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notedAt: { type: Date, default: Date.now },
});

const ProblemListSchema = new Schema<IProblemList>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
  problems: [ProblemSchema],
}, { timestamps: true });

ProblemListSchema.plugin(auditPlugin);

ProblemListSchema.index({ orgId: 1, patientId: 1 });

const ProblemList: Model<IProblemList> = models.ProblemList || mongoose.model<IProblemList>('ProblemList', ProblemListSchema);

export default ProblemList;