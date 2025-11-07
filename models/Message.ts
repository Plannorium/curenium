import mongoose, { Document, Schema, models, Model } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  userId: mongoose.Schema.Types.ObjectId;
  userName: string;
  userImage?: string;
  file?: any; // Can be a single file or an array of files
  room: string;
  reactions?: Map<string, { userId: string; userName: string }[]>;
  replyTo?: {
    id: string;
    userName: string;
    text: string;
  };
  deleted?: {
    by: string;
    at: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    text: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    file: { type: Schema.Types.Mixed },
    room: { type: String, required: true, index: true },
    reactions: { type: Map, of: [{ userId: String, userName: String }] },
    replyTo: {
      id: { type: String },
      userName: { type: String },
      text: { type: String },
    },
    deleted: {
      by: { type: String },
      at: { type: Date },
    },
  },
  { timestamps: true }
);

export default (models.Message as Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);