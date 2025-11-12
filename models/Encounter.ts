import mongoose, { Schema, models, Model, Document } from "mongoose";
import { AuditLogPlugin, IAuditable } from "./AuditLog";

export interface IEncounter extends Document, IAuditable {
  orgId: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  date: Date;
  type: "in-person" | "telehealth" | "phone";
  notes: Schema.Types.ObjectId[];
  vitals: Schema.Types.ObjectId;
  provider: Schema.Types.ObjectId;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["in-person", "telehealth", "phone"] },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
    vitals: { type: Schema.Types.ObjectId, ref: "Vital" },
    provider: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EncounterSchema.plugin(AuditLogPlugin);

const Encounter: Model<IEncounter> =
  models.Encounter || mongoose.model<IEncounter>("Encounter", EncounterSchema);

export default Encounter;