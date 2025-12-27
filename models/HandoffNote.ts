import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { auditPlugin } from '@/lib/mongooseAuditPlugin';

export interface IHandoffNote extends Document {
  orgId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorRole: string;
  type: 'ward' | 'department' | 'shift' | 'patient'; // Type of handoff
  shiftId?: mongoose.Types.ObjectId; // Optional link to shift
  patientId?: mongoose.Types.ObjectId; // Optional for patient-specific handoffs
  wardId?: mongoose.Types.ObjectId; // For ward-based handoffs
  departmentId?: mongoose.Types.ObjectId; // For department-based handoffs
  situation?: string;
  background?: string;
  assessment?: string;
  recommendation?: string;
  voiceTranscript?: string; // For voice input
  situationVoiceRecording?: string;
  backgroundVoiceRecording?: string;
  assessmentVoiceRecording?: string;
  recommendationVoiceRecording?: string;
  qrCode?: string; // QR code data URL
  visibility: 'team' | 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

const HandoffNoteSchema = new Schema<IHandoffNote>(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorRole: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ward', 'department', 'shift', 'patient'],
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShiftTracking',
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
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
      default: 'team',
    },
  },
  { timestamps: true }
);

HandoffNoteSchema.plugin(auditPlugin);

HandoffNoteSchema.index({ orgId: 1, createdAt: -1 });
HandoffNoteSchema.index({ shiftId: 1 });
HandoffNoteSchema.index({ patientId: 1 });
HandoffNoteSchema.index({ wardId: 1 });
HandoffNoteSchema.index({ departmentId: 1 });
HandoffNoteSchema.index({ type: 1 });

const HandoffNote: Model<IHandoffNote> = models.HandoffNote || mongoose.model<IHandoffNote>('HandoffNote', HandoffNoteSchema);

export default HandoffNote;