import mongoose, { Schema, models, Model, Document } from "mongoose";
import { Patient } from "@/types/patient";
import { auditPlugin } from "@/lib/mongooseAuditPlugin";

// Define the interface for the Patient document
export interface IPatient extends Patient {
  _setAuditContext(userId: string, userRole: string, before?: any, meta?: any): void;
}

const PatientSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    mrn: { type: String, index: true }, // medical record number
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    contact: {
      phone: String,
      email: String,
      address: String,
    },
    primaryPhysician: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: Object,
    deleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// PatientSchema.plugin(auditPlugin, { targetType: "Patient" });

PatientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const PatientModel = models.Patient || mongoose.model<IPatient & Document>("Patient", PatientSchema);

export default PatientModel as Model<IPatient & Document>;