import mongoose, { Schema, models, Document, Model, Types } from "mongoose";
import { auditPlugin } from "@/lib/mongooseAuditPlugin";

export interface IAttachment extends Document {
  orgId: Types.ObjectId;
  patientId: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  key?: string;
  url?: string;
  contentType?: string;
  size?: number;
  category: "lab" | "image" | "prescription" | "document" | "other";
  notes?: string;
  _setAuditContext(userId: string, userRole: string, before?: any, meta?: any): void;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    key: String, // storage key (R2/S3)
    url: String, // public or signed URL
    contentType: String,
    size: Number,
    category: { type: String, enum: ["lab", "image", "prescription", "document", "other"], default: "other" },
    notes: String,
  },
  { timestamps: true }
);

AttachmentSchema.plugin(auditPlugin, { targetType: "Attachment" });

const AttachmentModel = models.Attachment || mongoose.model<IAttachment>("Attachment", AttachmentSchema);

export default AttachmentModel as Model<IAttachment>;