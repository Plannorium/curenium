import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullName: string;
  username?: string;
  bio?: string;
  urls?: string[];
  email: string;
  image?: string;
  passwordHash?: string;
  emailVerified?: Date | null;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  role: "admin" | "doctor" | "nurse" | "manager" | "staff" | "labtech" | "reception";
  organizationId: mongoose.Schema.Types.ObjectId;
  provider?: string;
  providerAccountId?: string;
  verified: boolean;
  displaySettings: {
    items: string[];
    language: string;
    timezone: string;
  };
  appearanceSettings: {
    theme: string;
    font: string;
  };
  notificationSettings: {
    type: "all" | "mentions" | "none";
    mobile: boolean;
    communication_emails: boolean;
    social_emails: boolean;
    marketing_emails: boolean;
    security_emails: boolean;
  };
}

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, sparse: true },
    bio: { type: String },
    urls: { type: [String] },
    email: { type: String, unique: true, required: true },
    image: { type: String },
    passwordHash: { type: String },
    emailVerified: { type: Date, default: null },
    emailVerificationToken: { type: String, unique: true, sparse: true },
    emailVerificationTokenExpires: { type: Date },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "manager", "staff", "labtech", "reception"],
      default: "staff",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    provider: { type: String },
    providerAccountId: { type: String },
    verified: { type: Boolean, default: false },
    displaySettings: {
      items: { type: [String], default: ["recents", "home"] },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "Asia/Riyadh" },
    },
    appearanceSettings: {
      theme: { type: String, default: "light" },
      font: { type: String, default: "inter" },
    },
    notificationSettings: {
      type: { type: String, enum: ["all", "mentions", "none"], default: "mentions" },
      mobile: { type: Boolean, default: false },
      communication_emails: { type: Boolean, default: false },
      social_emails: { type: Boolean, default: true },
      marketing_emails: { type: Boolean, default: false },
      security_emails: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;