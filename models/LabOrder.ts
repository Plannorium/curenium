import mongoose, { Document, Model, Schema } from "mongoose";
import Patient from "./Patient";

export interface ILabOrder {
  _id: string;
  patientId: Schema.Types.ObjectId | any; // any for populated patient
  doctorId: Schema.Types.ObjectId;
  orgId: Schema.Types.ObjectId;
  testName: string;
  tests: string[];
  status: "Pending" | "Completed" | "Cancelled";
  results?: {
    public_id: string;
    secure_url: string;
    format: string;
    bytes: number;
    original_filename: string;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILabOrderDocument extends ILabOrder, Document {
  _id: any; // Override _id for Document compatibility
}

const ResultSchema = new Schema({
  public_id: { type: String, required: true },
  secure_url: { type: String, required: true },
  format: { type: String, required: true },
  bytes: { type: Number, required: true },
  original_filename: { type: String, required: true },
});

const LabOrderSchema: Schema<ILabOrderDocument> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    testName: { type: String, required: true },
    tests: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    results: [{ type: ResultSchema, required: false }],
    notes: { type: String },
  },
  { timestamps: true }
);

const LabOrder: Model<ILabOrderDocument> = mongoose.models.LabOrder || mongoose.model<ILabOrderDocument>("LabOrder", LabOrderSchema);

export default LabOrder;