import mongoose, { Schema, models } from "mongoose";

export interface IHandoffNote extends Document {
  orgId: string;
  author: mongoose.Types.ObjectId;
  authorRole: string;
  type: 'ward' | 'department' | 'shift' | 'patient';
  situation?: string;
  background?: string;
  assessment?: string;
  recommendation?: string;
  situationVoiceRecording?: string;
  backgroundVoiceRecording?: string;
  assessmentVoiceRecording?: string;
  recommendationVoiceRecording?: string;
  voiceTranscript?: string;
  qrCode?: string;
  visibility: 'team' | 'private' | 'public';
  shiftId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  wardId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HandoffNoteSchema = new Schema<IHandoffNote>(
  {
    orgId: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorRole: { type: String, required: true },
    type: {
      type: String,
      enum: ['ward', 'department', 'shift', 'patient'],
      required: true
    },
    situation: { type: String, required: false, default: '' },
    background: { type: String, required: false, default: '' },
    assessment: { type: String, required: false, default: '' },
    recommendation: { type: String, required: false, default: '' },
    situationVoiceRecording: { type: String },
    backgroundVoiceRecording: { type: String },
    assessmentVoiceRecording: { type: String },
    recommendationVoiceRecording: { type: String },
    voiceTranscript: { type: String },
    qrCode: { type: String },
    visibility: {
      type: String,
      enum: ['team', 'private', 'public'],
      default: 'team'
    },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  },
  { timestamps: true }
);

// Add indexes for better query performance
HandoffNoteSchema.index({ orgId: 1, type: 1, createdAt: -1 });
HandoffNoteSchema.index({ wardId: 1 });
HandoffNoteSchema.index({ departmentId: 1 });
HandoffNoteSchema.index({ shiftId: 1 });
HandoffNoteSchema.index({ patientId: 1 });

// Clear any existing model to ensure fresh schema
if (models.HandoffNote) {
  delete models.HandoffNote;
}

const HandoffNote = mongoose.model<IHandoffNote>("HandoffNote", HandoffNoteSchema);
export { HandoffNote };
export default HandoffNote;