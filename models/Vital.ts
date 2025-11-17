import mongoose, { Schema, models, Model } from "mongoose";
import { Vital } from "@/types/vital";
import { AuditLogPlugin, IAuditable } from "./AuditLog";

const VitalSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordedAt: { type: Date, required: true, default: Date.now },
    bpSystolic: Number,
    bpDiastolic: Number,
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    spo2: Number,
    notes: String,
    isUrgent: { type: Boolean, default: false },
    height: Number,
    weight: Number,
    bmi: Number,
  },
  { timestamps: true }
);

VitalSchema.plugin(AuditLogPlugin);

const VitalModel =
  models.Vital || mongoose.model<Vital & IAuditable>("Vital", VitalSchema);

export default VitalModel as Model<Vital & IAuditable>;