import mongoose, { Schema, models, Model, Document } from "mongoose";

export interface INursingCarePlan extends Document {
  patientId: Schema.Types.ObjectId;
  nurseId: Schema.Types.ObjectId;
  diagnoses: string[];
  interventions: string[];
  outcomes: string[];
  evaluation: string;
  status: "Active" | "Resolved" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const NursingCarePlanSchema = new Schema<INursingCarePlan>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    nurseId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diagnoses: [{ type: String }],
    interventions: [{ type: String }],
    outcomes: [{ type: String }],
    evaluation: String,
    status: {
      type: String,
      enum: ["Active", "Resolved", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const NursingCarePlanModel =
  (models.NursingCarePlan as Model<INursingCarePlan>) ||
  mongoose.model<INursingCarePlan>("NursingCarePlan", NursingCarePlanSchema);

export default NursingCarePlanModel;