
import mongoose, { Document, Schema, models, Model } from 'mongoose';

export interface IDMRoom extends Document {
  room: string;
  participants: mongoose.Schema.Types.ObjectId[];
  messages: mongoose.Schema.Types.ObjectId[];
}

const DMRoomSchema = new Schema<IDMRoom>(
  {
    room: { type: String, required: true, unique: true, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true }
);

export default (models.DMRoom as Model<IDMRoom>) ||
  mongoose.model<IDMRoom>('DMRoom', DMRoomSchema);