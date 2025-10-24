import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShift extends Document {
  date: Date;
  startTime: Date;
  endTime: Date;
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'doctor' | 'nurse' | 'manager' | 'staff' | 'labtech' | 'reception';
  organization: mongoose.Types.ObjectId;
  status: 'on-shift' | 'on-call' | 'upcoming';
  initials: string;
  avatar?: string;
}

const ShiftSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'nurse', 'manager', 'staff', 'labtech', 'reception'],
      required: true,
    },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: {
      type: String,
      enum: ['on-shift', 'on-call', 'upcoming'],
      required: true,
      default: 'upcoming',
    },
    initials: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

const Shift: Model<IShift> = mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);

export default Shift;