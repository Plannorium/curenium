import mongoose, { Schema, models, Model, Document } from "mongoose";
import { Patient } from "@/types/patient";
import { AuditLogPlugin, IAuditable } from "./AuditLog";

// Define the interface for the Patient document
type PatientDocument = Patient & Document & IAuditable;

export interface IPatient extends PatientDocument {}

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
    // Nursing-specific fields
    admissionType: { type: String, enum: ["inpatient", "outpatient", "emergency", "day-surgery"] },
    ward: { type: String },
    department: { type: String },
    roomNumber: { type: String },
    bedNumber: { type: String },
    assignedNurse: { type: Schema.Types.ObjectId, ref: "User" },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: "User" },
    admissionDate: { type: Date },
    dischargeDate: { type: Date },
    careLevel: { type: String, enum: ["critical", "intermediate", "basic"] },
    isolationStatus: { type: String, enum: ["none", "contact", "droplet", "airborne"], default: "none" },
    fallRisk: { type: String, enum: ["low", "medium", "high"] },
    mobilityStatus: { type: String, enum: ["independent", "assisted", "wheelchair", "bedridden"] },
  },
  { timestamps: true }
);

PatientSchema.plugin(AuditLogPlugin);

PatientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const PatientModel = models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default PatientModel as Model<IPatient>;