import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  providerId: mongoose.Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  createdBy: mongoose.Schema.Types.ObjectId;
  notes?: string;
  displayDateHijri?: string; // For quicker queries
}

const BookingSchema: Schema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  displayDateHijri: { type: String }, // For quicker queries
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);