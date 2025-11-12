import mongoose, { Schema, models, Model } from "mongoose";
import { Vital } from "@/types/vital";

const VitalSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    recordedAt: { type: Date, required: true, default: Date.now },
    bpSystolic: Number,
    bpDiastolic: Number,
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    spo2: Number,
    notes: String,
    height: Number,
    weight: Number,
    bmi: Number,
  },
  { timestamps: true }
);

const VitalModel = models.Vital || mongoose.model<Vital>("Vital", VitalSchema);

export default VitalModel as Model<Vital>;