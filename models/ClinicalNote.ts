import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IClinicalNote extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  doctorId: mongoose.Schema.Types.ObjectId;
  orgId: mongoose.Schema.Types.ObjectId;
  content: string;
  visibility: 'team' | 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

const ClinicalNoteSchema = new Schema<IClinicalNote>(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    content: { type: String, required: true },
    visibility: {
      type: String,
      enum: ['team', 'private', 'public'],
      default: 'team'
    },
  },
  { timestamps: true }
);

const ClinicalNoteModel =
  (models.ClinicalNote as Model<IClinicalNote>) ||
  mongoose.model<IClinicalNote>('ClinicalNote', ClinicalNoteSchema);

export default ClinicalNoteModel;