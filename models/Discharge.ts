import mongoose, { Schema, Document, Model } from 'mongoose';

export type DischargeStatus =
  | 'planned'        // Discharge planned
  | 'in_progress'    // Discharge process started
  | 'completed'      // Patient discharged
  | 'cancelled';     // Discharge cancelled

export interface IDischarge extends Document {
  patient: mongoose.Types.ObjectId;
  admission: mongoose.Types.ObjectId; // Reference to the admission record
  doctor: mongoose.Types.ObjectId; // Doctor overseeing discharge
  matronNurse: mongoose.Types.ObjectId; // Matron Nurse managing discharge
  organization: mongoose.Types.ObjectId;

  // Discharge details
  plannedDate: Date;
  actualDischargeDate?: Date;
  dischargeType: 'routine' | 'against_medical_advice' | 'transfer' | 'death';
  dischargeReason: string;

  // Clinical summary
  dischargeDiagnosis?: string;
  clinicalSummary?: string;
  medicationsOnDischarge?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
  }>;

  // Follow-up care
  followUpInstructions?: string;
  followUpAppointments?: Array<{
    date: Date;
    type: string;
    notes?: string;
  }>;

  // Status and workflow
  status: DischargeStatus;
  initiatedAt: Date;
  completedAt?: Date;

  // Documentation
  dischargeNotes?: string;
  patientInstructions?: string;
  caregiverInstructions?: string;

  // Administrative
  dischargePapers?: string[]; // URLs to discharge documents
  finalBill?: number;
  insuranceStatus?: string;

  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DischargeSchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    admission: {
      type: Schema.Types.ObjectId,
      ref: 'Admission',
      required: true
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matronNurse: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },

    // Discharge details
    plannedDate: {
      type: Date,
      required: true
    },
    actualDischargeDate: Date,
    dischargeType: {
      type: String,
      enum: ['routine', 'against_medical_advice', 'transfer', 'death'],
      required: true
    },
    dischargeReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    // Clinical summary
    dischargeDiagnosis: {
      type: String,
      trim: true,
      maxlength: 500
    },
    clinicalSummary: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    medicationsOnDischarge: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true,
        trim: true
      },
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: String,
        trim: true
      }
    }],

    // Follow-up care
    followUpInstructions: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    followUpAppointments: [{
      date: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        required: true,
        trim: true
      },
      notes: {
        type: String,
        trim: true
      }
    }],

    // Status and workflow
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    initiatedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,

    // Documentation
    dischargeNotes: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    patientInstructions: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    caregiverInstructions: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    // Administrative
    dischargePapers: [{
      type: String,
      trim: true
    }],
    finalBill: {
      type: Number,
      min: 0
    },
    insuranceStatus: {
      type: String,
      trim: true,
      maxlength: 100
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
DischargeSchema.index({ organization: 1, status: 1 });
DischargeSchema.index({ patient: 1 });
DischargeSchema.index({ admission: 1 }, { unique: true }); // One discharge per admission
DischargeSchema.index({ doctor: 1 });
DischargeSchema.index({ matronNurse: 1 });
DischargeSchema.index({ plannedDate: 1 });
DischargeSchema.index({ actualDischargeDate: 1 });
DischargeSchema.index({ status: 1, plannedDate: 1 });

const Discharge: Model<IDischarge> = mongoose.models.Discharge || mongoose.model<IDischarge>('Discharge', DischargeSchema);

export default Discharge;