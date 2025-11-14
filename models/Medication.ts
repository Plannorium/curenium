import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { AuditLogPlugin, IAuditable } from "./AuditLog";

export interface IMedication extends Document, IAuditable {
  patientId: Types.ObjectId;
  orgId: Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "inactive" | "discontinued";
  notes?: string;
  deleted?: boolean; // Make deleted optional for soft delete
}

const MedicationSchema = new Schema<IMedication>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    route: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },
    notes: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MedicationSchema.plugin(AuditLogPlugin);

const Medication: Model<IMedication> =
  mongoose.models.Medication ||
  mongoose.model<IMedication>("Medication", MedicationSchema);

export default Medication;