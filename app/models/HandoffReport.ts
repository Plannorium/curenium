import mongoose, { Schema, models } from "mongoose";

export interface IHandOffReport {
  patientId?: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  sbar: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  createdBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  qrCode?: string;
  isArchived?: boolean;
}

const HandoffReportSchema = new Schema<IHandOffReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    shiftId: { type: Schema.Types.ObjectId, ref: 'ShiftTracking' },
    sbar: {
      situation: { type: String, required: true },
      background: { type: String, required: true },
      assessment: { type: String, required: true },
      recommendation: { type: String, required: true }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, required: true },
    qrCode: String,
    isArchived: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
HandoffReportSchema.index({ organizationId: 1, createdAt: -1 });
HandoffReportSchema.index({ patientId: 1, createdAt: -1 });
HandoffReportSchema.index({ shiftId: 1, createdAt: -1 });
HandoffReportSchema.index({ createdBy: 1, createdAt: -1 });

export const HandoffReport =
  models.HandoffReport || mongoose.model<IHandOffReport>('HandoffReport', HandoffReportSchema);