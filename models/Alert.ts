import mongoose, { Document, Model, Schema, models, model } from 'mongoose';

export interface IAlert extends Document {
  message: string;
  level: 'critical' | 'urgent' | 'info';
  organizationId: mongoose.Schema.Types.ObjectId;
  recipients: mongoose.Schema.Types.ObjectId[];
  createdBy: mongoose.Schema.Types.ObjectId;
  patientId?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({ 
   message: { type: String, required: true }, 
   level: { 
     type: String, 
     enum: ['critical', 'urgent', 'info'], 
     required: true, 
   }, 
   organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }, 
   recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
   patientId: { type: Schema.Types.ObjectId, ref: 'Patient' }, 
 }, { 
   timestamps: true, 
 });

export default (models.Alert as Model<IAlert>) || model<IAlert>('Alert', AlertSchema);