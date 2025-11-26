import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdmissionStatus =
  | 'requested'      // Doctor requested admission
  | 'pending_review' // Matron Nurse reviewing
  | 'approved'       // Matron Nurse approved, waiting for ward assignment
  | 'assigned'       // Ward assigned, patient admitted
  | 'completed'      // Patient discharged
  | 'cancelled';     // Admission cancelled

export interface IAdmission extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId; // Doctor who requested admission
  matronNurse?: mongoose.Types.ObjectId; // Matron Nurse who reviewed/approved
  organization: mongoose.Types.ObjectId;

  // Request details
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  estimatedStay?: number; // days
  specialRequirements?: string[];

  // Ward assignment
  department?: mongoose.Types.ObjectId;
  ward?: mongoose.Types.ObjectId;
  bedNumber?: string;

  // Status and workflow
  status: AdmissionStatus;
  requestedAt: Date;
  reviewedAt?: Date;
  assignedAt?: Date;
  completedAt?: Date;

  // Notes and comments
  doctorNotes?: string;
  matronNurseNotes?: string;
  wardNotes?: string;

  // Discharge info (when completed)
  dischargeReason?: string;
  dischargeNotes?: string;

  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matronNurse: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },

    // Request details
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      required: true
    },
    estimatedStay: {
      type: Number,
      min: 1,
      max: 365
    },
    specialRequirements: [{
      type: String,
      trim: true
    }],

    // Ward assignment
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: 'Ward'
    },
    bedNumber: {
      type: String,
      trim: true,
      maxlength: 10
    },

    // Status and workflow
    status: {
      type: String,
      enum: ['requested', 'pending_review', 'approved', 'assigned', 'completed', 'cancelled'],
      default: 'requested'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    assignedAt: Date,
    completedAt: Date,

    // Notes and comments
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    matronNurseNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    wardNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    // Discharge info
    dischargeReason: {
      type: String,
      trim: true,
      maxlength: 500
    },
    dischargeNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
AdmissionSchema.index({ organization: 1, status: 1 });
AdmissionSchema.index({ patient: 1 });
AdmissionSchema.index({ doctor: 1 });
AdmissionSchema.index({ matronNurse: 1 });
AdmissionSchema.index({ ward: 1 });
AdmissionSchema.index({ department: 1 });
AdmissionSchema.index({ requestedAt: -1 });
AdmissionSchema.index({ status: 1, requestedAt: -1 });

// Prevent duplicate active admissions for same patient
AdmissionSchema.index(
  { patient: 1, status: 1 },
  {
    partialFilterExpression: {
      status: { $in: ['requested', 'pending_review', 'approved', 'assigned'] }
    },
    unique: true
  }
);

const Admission: Model<IAdmission> = mongoose.models.Admission || mongoose.model<IAdmission>('Admission', AdmissionSchema);

export default Admission;