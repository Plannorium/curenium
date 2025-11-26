import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  headOfDepartment?: mongoose.Types.ObjectId; // Reference to User (Doctor/Head)
  organization: mongoose.Types.ObjectId;
  isActive: boolean;
  specialties?: string[]; // e.g., ['Cardiology', 'Neurology']
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    headOfDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    specialties: [{
      type: String,
      trim: true
    }],
    contactInfo: {
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
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
DepartmentSchema.index({ organization: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ organization: 1, isActive: 1 });
DepartmentSchema.index({ headOfDepartment: 1 });

const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;