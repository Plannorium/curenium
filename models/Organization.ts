import mongoose, { Document, Model } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  email: string;
  domain?: string;
  image?: string;
  timezone: string;
  language: "en" | "es" | "ar";
  activeHoursStart?: string;
  activeHoursEnd?: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  requireAdminVerification: boolean;
}

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    domain: { type: String },
    image: { type: String },
    timezone: { type: String },
    language: { type: String, enum: ["en", "es", "ar"] },
    activeHoursStart: { type: String },
    activeHoursEnd: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    requireAdminVerification: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;