import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ILabOrder {
  _id: string;
  patientId: Schema.Types.ObjectId | any; // any for populated patient
  doctorId: Schema.Types.ObjectId;
  orgId: Schema.Types.ObjectId;
  testName: string;
  tests: string[];
  status: "Pending" | "Completed" | "Cancelled";
  results?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILabOrderDocument extends ILabOrder, Document {
  _id: any; // Override _id for Document compatibility
}

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
    results: { type: String },
  },
  { timestamps: true }
);

const LabOrder: Model<ILabOrderDocument> = models.LabOrder || mongoose.model<ILabOrderDocument>("LabOrder", LabOrderSchema);

export default LabOrder;