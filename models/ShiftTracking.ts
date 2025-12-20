import mongoose, { Schema, Document, Model } from 'mongoose';

export type ShiftStatus =
  | 'scheduled'      // Shift scheduled but not started
  | 'active'         // Currently on shift
  | 'on_break'       // On break during shift
  | 'completed'      // Shift completed successfully
  | 'absent'         // No-show or absent
  | 'cancelled';     // Shift cancelled

export type BreakType =
  | 'lunch'
  | 'rest'
  | 'meeting'
  | 'emergency'
  | 'other';

export interface IShiftTracking extends Document {
  user: mongoose.Types.ObjectId; // Nurse/Staff member
  userImage?: string; // Cached user image for better performance
  organization: mongoose.Types.ObjectId;

  // Shift details
  shiftDate: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;

  // Status and tracking
  status: ShiftStatus;
  department?: mongoose.Types.ObjectId;
  ward?: mongoose.Types.ObjectId;
  role: string; // e.g., 'matron_nurse', 'nurse', 'admin'

  // Task tracking
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'medication' | 'vital_check' | 'assessment' | 'documentation' | 'custom';
    patientId?: mongoose.Types.ObjectId;
    prescriptionId?: mongoose.Types.ObjectId;
    dueTime?: Date;
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    notes?: string;
    delegatedTo?: mongoose.Types.ObjectId; // CNA or other staff
    reminderSent?: boolean;
  }>;

  // Break tracking
  breaks: Array<{
    type: BreakType;
    startTime: Date;
    endTime?: Date;
    duration?: number; // minutes
    notes?: string;
  }>;

  // Notes and handover
  shiftNotes?: string;
  handoverNotes?: string;
  morningReport?: string;
  eveningReport?: string;

  // Performance metrics
  tasksCompleted?: number;
  incidentsReported?: number;
  patientInteractions?: number;

  // Administrative
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved
  approvedAt?: Date;
  modifiedBy?: mongoose.Types.ObjectId; // Who last modified
  modificationReason?: string;

  // Audit trail
  loginEvents: Array<{
    timestamp: Date;
    action: 'login' | 'logout' | 'break_start' | 'break_end';
    location?: string;
    notes?: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const ShiftTrackingSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userImage: {
      type: String,
      trim: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },

    // Shift details
    shiftDate: {
      type: Date,
      required: true
    },
    scheduledStart: {
      type: Date,
      required: true
    },
    scheduledEnd: {
      type: Date,
      required: true
    },
    actualStart: Date,
    actualEnd: Date,

    // Status and tracking
    status: {
      type: String,
      enum: ['scheduled', 'active', 'on_break', 'completed', 'absent', 'cancelled'],
      default: 'scheduled'
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: 'Ward'
    },
    role: {
      type: String,
      required: true,
      trim: true
    },

    // Task tracking
    tasks: [{
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        enum: ['medication', 'vital_check', 'assessment', 'documentation', 'custom'],
        required: true
      },
      patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
      },
      prescriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Prescription'
      },
      dueTime: Date,
      completedAt: Date,
      completedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'overdue', 'cancelled'],
        default: 'pending'
      },
      notes: {
        type: String,
        trim: true
      },
      delegatedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reminderSent: {
        type: Boolean,
        default: false
      }
    }],

    // Break tracking
    breaks: [{
      type: {
        type: String,
        enum: ['lunch', 'rest', 'meeting', 'emergency', 'other'],
        required: true
      },
      startTime: {
        type: Date,
        required: true
      },
      endTime: Date,
      duration: {
        type: Number,
        min: 0
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 500
      }
    }],

    // Notes and handover
    shiftNotes: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    handoverNotes: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    morningReport: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    eveningReport: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    // Performance metrics
    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    incidentsReported: {
      type: Number,
      default: 0,
      min: 0
    },
    patientInteractions: {
      type: Number,
      default: 0,
      min: 0
    },

    // Administrative
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    modificationReason: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Audit trail
    loginEvents: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        enum: ['login', 'logout', 'break_start', 'break_end'],
        required: true
      },
      location: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 200
      }
    }]
  },
  {
    timestamps: true
  }
);

// Virtual for total break time
ShiftTrackingSchema.virtual('totalBreakTime').get(function(this: IShiftTracking) {
  return this.breaks
    .filter(b => b.endTime)
    .reduce((total, b) => total + (b.duration || 0), 0);
});

// Virtual for actual shift duration
ShiftTrackingSchema.virtual('actualDuration').get(function(this: IShiftTracking) {
  if (!this.actualStart || !this.actualEnd) return 0;
  const duration = this.actualEnd.getTime() - this.actualStart.getTime();
  const breakTime = this.breaks
    .filter(b => b.endTime && b.duration)
    .reduce((total, b) => total + (b.duration || 0), 0) * 60 * 1000; // Convert minutes to ms
  return Math.max(0, duration - breakTime);
});

// Ensure virtual fields are serialized
ShiftTrackingSchema.set('toJSON', { virtuals: true });
ShiftTrackingSchema.set('toObject', { virtuals: true });

// Indexes for performance
ShiftTrackingSchema.index({ organization: 1, user: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ organization: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ organization: 1, status: 1 });
ShiftTrackingSchema.index({ user: 1, shiftDate: -1 });
ShiftTrackingSchema.index({ department: 1 });
ShiftTrackingSchema.index({ ward: 1 });
ShiftTrackingSchema.index({ scheduledStart: 1 });
ShiftTrackingSchema.index({ status: 1, shiftDate: -1 });

const ShiftTracking: Model<IShiftTracking> = mongoose.models.ShiftTracking || mongoose.model<IShiftTracking>('ShiftTracking', ShiftTrackingSchema);

export default ShiftTracking;