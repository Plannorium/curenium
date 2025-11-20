import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ILabOrder extends Document {
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  orgId: Schema.Types.ObjectId;
  tests: string[];
  status: "Pending" | "Completed" | "Cancelled";
  results?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabOrderSchema: Schema<ILabOrder> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
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

const LabOrder: Model<ILabOrder> = models.LabOrder || mongoose.model<ILabOrder>("LabOrder", LabOrderSchema);

export default LabOrder;