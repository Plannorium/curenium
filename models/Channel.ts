import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  isDefault: boolean; // For channels like 'general'
}

const ChannelSchema: Schema<IChannel> = new Schema({
  name: {
    type: String,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isDefault: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default (mongoose.models.Channel as Model<IChannel>) || mongoose.model<IChannel>('Channel', ChannelSchema);