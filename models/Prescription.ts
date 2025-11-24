import mongoose, { Schema, models, Model } from "mongoose";
import { Prescription } from "@/types/prescription";

const PrescriptionSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    prescribedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medication: String,
    dose: String,
    frequency: String,
    route: String,
    durationDays: Number,
    notes: String,
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    dispensedBy: { type: Schema.Types.ObjectId, ref: "User" },
    dispensedNotes: String,
  },
  { timestamps: true }
);

const PrescriptionModel =
  models.Prescription ||
  mongoose.model<Prescription>("Prescription", PrescriptionSchema);

export default PrescriptionModel as Model<Prescription>;