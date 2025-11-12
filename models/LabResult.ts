import mongoose, { Document, Schema, Types, Model } from "mongoose";
import { IAuditable } from "./AuditLog";

export interface ILabResult extends Document, IAuditable {
  patientId: Types.ObjectId;
  orgId: Types.ObjectId;
  testName: string;
  value: string;
  units: string;
  referenceRange: string;
  collectedDate: Date;
  reportedDate: Date;
  notes?: string;
  deleted: boolean;
}

const LabResultSchema = new Schema<ILabResult>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    testName: { type: String, required: true },
    value: { type: String, required: true },
    units: { type: String },
    referenceRange: { type: String },
    collectedDate: { type: Date, required: true },
    reportedDate: { type: Date },
    notes: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LabResult: Model<ILabResult> = mongoose.models.LabResult || mongoose.model<ILabResult>("LabResult", LabResultSchema);

export default LabResult;