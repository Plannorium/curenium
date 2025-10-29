import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

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

let CallSessionModel: Model<ICallSession>;

// Export a function to get the model, ensuring it's only accessed after mongoose is connected
export function getCallSessionModel(): Model<ICallSession> {
  if (!CallSessionModel || mongoose.connection.readyState === 0) { // Re-initialize if not set or connection dropped
    CallSessionModel = mongoose.models.CallSession as Model<ICallSession> || mongoose.model<ICallSession>('CallSession', CallSessionSchema);
  }
  return CallSessionModel;
}