import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IAlert extends Document {
  message: string;
  level: 'critical' | 'urgent' | 'info';
  organizationId: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default models.Alert || model<IAlert>('Alert', AlertSchema);