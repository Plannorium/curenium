import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  id: string;
  _id: Types.ObjectId;
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  title: string;
  description?: string;
  type: 'medication' | 'vital_check' | 'assessment' | 'documentation' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueTime?: Date;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  assignedTo?: Types.ObjectId;
  completedBy?: Types.ObjectId;
  completedAt?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
  // `id` is kept for backward compatibility. We don't index null values to
  // avoid duplicate-key errors if old documents have `id: null`.
  id: { type: String },
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['medication', 'vital_check', 'assessment', 'documentation', 'custom'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueTime: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'overdue', 'cancelled'], default: 'pending' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

// Create a unique index for `id` but only for documents where `id` is a string
// (prevents errors if older documents have `id: null`). This keeps uniqueness
// for valid ids while ignoring null/missing values.
TaskSchema.index({ id: 1 }, { unique: true, partialFilterExpression: { id: { $type: 'string' } } });

TaskSchema.pre('save', function (next) {
  if (this.isNew && !(this as any).id) {
    // ensure id string is set for backward compatibility only if not already provided
    (this as any).id = (this as any)._id.toString();
  }
  next();
});

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
