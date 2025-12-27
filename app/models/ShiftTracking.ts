import mongoose, { Schema, models } from "mongoose";

export type ShiftStatus = 'scheduled' | 'active' | 'on_break' | 'on_call' | 'completed' | 'absent' | 'cancelled';

export interface IShiftTracking {
  user: mongoose.Types.ObjectId;
  userImage?: string;
  organization: mongoose.Types.ObjectId;
  shiftDate: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: ShiftStatus;
  department?: mongoose.Types.ObjectId;
  ward?: mongoose.Types.ObjectId;
  role: string;
  breaks: Array<{
    type: 'lunch' | 'rest' | 'meeting' | 'emergency' | 'other';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    notes?: string;
  }>;
  shiftNotes?: string;
  handoverNotes?: string;
  morningReport?: string;
  eveningReport?: string;
  tasksCompleted?: number;
  incidentsReported?: number;
  patientInteractions?: number;
  loginEvents: Array<{
    timestamp: Date;
    action: 'login' | 'logout' | 'break_start' | 'break_end' | 'on_call_start' | 'on_call_end';
    location?: string;
    notes?: string;
  }>;
  // On-call fields
  onCallStart?: Date;
  onCallEnd?: Date;
  onCallDuration?: number;
  onCallNotes?: string;
  // Admin fields
  approvedBy?: mongoose.Types.ObjectId;
  modifiedBy?: mongoose.Types.ObjectId;
  modificationReason?: string;
  reviewedAt?: Date;
  assignedAt?: Date;
  completedAt?: Date;
  isMissed?: boolean;
  missedDuration?: number;
  isFromBasicShifts?: boolean;
}

const ShiftTrackingSchema = new Schema<IShiftTracking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userImage: String,
    organization: { type: Schema.Types.ObjectId, required: true },
    shiftDate: { type: Date, required: true },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: Date,
    actualEnd: Date,
    status: {
      type: String,
      enum: ['scheduled', 'active', 'on_break', 'on_call', 'completed', 'absent', 'cancelled'],
      default: 'scheduled'
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward' },
    role: { type: String, required: true },
    breaks: [{
      type: {
        type: String,
        enum: ['lunch', 'rest', 'meeting', 'emergency', 'other'],
        default: 'rest'
      },
      startTime: { type: Date, required: true },
      endTime: Date,
      duration: Number,
      notes: String
    }],
    shiftNotes: String,
    handoverNotes: String,
    morningReport: String,
    eveningReport: String,
    tasksCompleted: Number,
    incidentsReported: Number,
    patientInteractions: Number,
    loginEvents: [{
      timestamp: { type: Date, default: Date.now },
      action: {
        type: String,
        enum: ['login', 'logout', 'break_start', 'break_end', 'on_call_start', 'on_call_end'],
        required: true
      },
      location: String,
      notes: String
    }],
    // On-call fields
    onCallStart: Date,
    onCallEnd: Date,
    onCallDuration: Number,
    onCallNotes: String,
    // Admin fields
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modificationReason: String,
    reviewedAt: Date,
    assignedAt: Date,
    completedAt: Date,
    isMissed: { type: Boolean, default: false },
    missedDuration: Number,
    isFromBasicShifts: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
ShiftTrackingSchema.index({ organization: 1, user: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ organization: 1, status: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ user: 1, status: 1 });
ShiftTrackingSchema.index({ department: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ ward: 1, shiftDate: -1 });

export const ShiftTracking =
  models.ShiftTracking || mongoose.model<IShiftTracking>('ShiftTracking', ShiftTrackingSchema);