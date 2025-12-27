import mongoose, { Schema, Document, models, Model } from 'mongoose';
// import { auditPlugin } from '@/lib/mongooseAuditPlugin';

export interface IHandoffReport extends Document {
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
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

const HandoffReportSchema = new Schema<IHandoffReport>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
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

// HandoffReportSchema.plugin(auditPlugin);

HandoffReportSchema.index({ organizationId: 1, createdAt: -1 });
HandoffReportSchema.index({ shiftId: 1 });
HandoffReportSchema.index({ patientId: 1 });
HandoffReportSchema.index({ wardId: 1 });
HandoffReportSchema.index({ departmentId: 1 });
HandoffReportSchema.index({ type: 1 });

const HandoffReport: Model<IHandoffReport> = models.HandoffReport || mongoose.model<IHandoffReport>('HandoffReport', HandoffReportSchema);

export default HandoffReport;