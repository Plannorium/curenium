import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWard extends Document {
  name: string;
  wardNumber: string;
  department: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  description?: string;
  totalBeds: number;
  occupiedBeds: number;
  wardType: 'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric' | 'surgical' | 'medical';
  floor?: string;
  building?: string;
  isActive: boolean;
  chargeNurse?: mongoose.Types.ObjectId; // Matron Nurse in charge
  assignedNurses: mongoose.Types.ObjectId[]; // Array of assigned nurses
  contactInfo?: {
    phone?: string;
    extension?: string;
  };
  facilities?: string[]; // e.g., ['Ventilator', 'Monitor', 'Defibrillator']
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    wardNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    totalBeds: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: 0
    },
    wardType: {
      type: String,
      enum: ['general', 'icu', 'emergency', 'maternity', 'pediatric', 'surgical', 'medical'],
      required: true
    },
    floor: {
      type: String,
      trim: true,
      maxlength: 20
    },
    building: {
      type: String,
      trim: true,
      maxlength: 50
    },
    isActive: {
      type: Boolean,
      default: true
    },
    chargeNurse: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedNurses: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    contactInfo: {
      phone: {
        type: String,
        trim: true
      },
      extension: {
        type: String,
        trim: true
      }
    },
    facilities: [{
      type: String,
      trim: true
    }],
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

// Virtual for available beds
WardSchema.virtual('availableBeds').get(function(this: IWard) {
  return this.totalBeds - this.occupiedBeds;
});

// Ensure virtual fields are serialized
WardSchema.set('toJSON', { virtuals: true });
WardSchema.set('toObject', { virtuals: true });

// Indexes for performance
WardSchema.index({ organization: 1, department: 1 });
WardSchema.index({ organization: 1, wardNumber: 1 }, { unique: true });
WardSchema.index({ organization: 1, isActive: 1 });
WardSchema.index({ department: 1 });
WardSchema.index({ chargeNurse: 1 });
WardSchema.index({ assignedNurses: 1 });

const Ward: Model<IWard> = mongoose.models.Ward || mongoose.model<IWard>('Ward', WardSchema);

export default Ward;