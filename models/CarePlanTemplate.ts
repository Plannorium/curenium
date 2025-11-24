
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';
import { IOrganization } from './Organization';
import { IUser } from './User';

interface ISection {
  title: string;
  fields: string[];
}

export interface ICarePlanTemplate extends Document {
  orgId: IOrganization['_id'];
  slug: string;
  title: string;
  sections: ISection[];
  createdBy: IUser['_id'];
}

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  fields: [{ type: String }],
});

const CarePlanTemplateSchema = new Schema<ICarePlanTemplate>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  sections: [SectionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

CarePlanTemplateSchema.plugin(auditPlugin);

CarePlanTemplateSchema.index({ orgId: 1, slug: 1 });

const CarePlanTemplate: Model<ICarePlanTemplate> = models.CarePlanTemplate || mongoose.model<ICarePlanTemplate>('CarePlanTemplate', CarePlanTemplateSchema);

export default CarePlanTemplate;