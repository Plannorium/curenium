import mongoose, { Schema, Document } from 'mongoose';

export interface IAdministrationRecord extends Document {
  administeredBy: mongoose.Schema.Types.ObjectId;
  administeredAt: Date;
  doseAdministered?: string;
  notes?: string;
  status: 'administered' | 'missed' | 'patient_refused' | 'not_available';
}

const AdministrationRecordSchema: Schema = new Schema({
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  administeredAt: { type: Date, default: Date.now },
  doseAdministered: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['administered', 'missed', 'patient_refused', 'not_available'], required: true },
});

export interface IPrescription extends Document {
  orgId: mongoose.Schema.Types.ObjectId;
  patientId: mongoose.Schema.Types.ObjectId;
  prescribedBy: mongoose.Schema.Types.ObjectId;
  medications?: string[];
  medication?: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays?: number;
  startDate?: Date;
  endDate?: Date;
  refills?: number;
  instructions?: string;
  reasonForPrescription?: string;
  status: 'active' | 'completed' | 'cancelled';
  statusReason?: string;
  notes?: string;
  dispensed: boolean;
  dispensedBy?: mongoose.Schema.Types.ObjectId;
  dispensedNotes?: string;
  dispensedAt?: Date;
  administrations?: IAdministrationRecord[];
}

const PrescriptionSchema: Schema = new Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medications: { type: [String] },
  medication: { type: String },
  dose: { type: String, required: true },
  frequency: { type: String, required: true },
  route: { type: String, required: true },
  durationDays: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  refills: { type: Number },
  instructions: { type: String },
  reasonForPrescription: { type: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  statusReason: { type: String },
  notes: { type: String },
  dispensed: { type: Boolean, default: false },
  dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispensedNotes: { type: String },
  dispensedAt: { type: Date },
  administrations: { type: [AdministrationRecordSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);