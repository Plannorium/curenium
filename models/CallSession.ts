import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICallSession extends Document {
  roomId: string;
  users: string[];
  startTime: Date;
  endTime?: Date;
}

const CallSessionSchema = new Schema<ICallSession>({
  roomId: { type: String, required: true },
  users: [{ type: String }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

const CallSession: Model<ICallSession> =
  mongoose.models.CallSession ||
  mongoose.model<ICallSession>('CallSession', CallSessionSchema);

export default CallSession;
