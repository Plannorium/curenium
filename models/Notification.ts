import mongoose, { Document, Model, Schema, models, model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'new_message' | 'system_alert' | 'new_patient' | 'share.request' | 'document_upload';
  read: boolean;
  link?: string;
  relatedId?: mongoose.Schema.Types.ObjectId;
  sender?: {
    _id: mongoose.Schema.Types.ObjectId;
    fullName: string;
    image?: string;
  };
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_message', 'system_alert', 'new_patient', 'share.request', 'document_upload'],
    required: true,
  },
  read: { type: Boolean, default: false },
  relatedId: { type: Schema.Types.ObjectId },
  link: { type: String },
  sender: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String },
    image: { type: String },
  },
}, {
  timestamps: true,
});

export default (models.Notification as Model<INotification>) || model<INotification>('Notification', NotificationSchema);