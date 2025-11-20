import mongoose, { Document, Model } from "mongoose";

export interface IInvite extends Document {
  email: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  role: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: Date;
  invitedBy: mongoose.Schema.Types.ObjectId;
  acceptedAt?: Date;
}

const InviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "manager", "staff", "labtech", "reception", "user"],
    },
    token: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    }, // 24 hours
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

const Invite: Model<IInvite> =
  mongoose.models.Invite || mongoose.model<IInvite>("Invite", InviteSchema);

export default Invite;