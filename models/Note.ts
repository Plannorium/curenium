import mongoose, { Schema, models, Document, Model } from "mongoose";

// Interface for the Note document
export interface INote extends Document {
  orgId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  shift: mongoose.Types.ObjectId;
  role?: string;
  content: string;
  visibility: "private" | "team" | "public";
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shift: { type: Schema.Types.ObjectId, ref: "Shift", required: true, index: true },
    role: { type: String },
    content: { type: String, required: true },
    visibility: { type: String, enum: ["private", "team", "public"], default: "team" },
  },
  { timestamps: true }
);

// Check if the model already exists before defining it
const Note: Model<INote> = models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;