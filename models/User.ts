import mongoose, { Document, Model, models } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullName: string;
  email: string;
  online?: boolean;
  password?: string; // For migration purposes
  passwordHash?: string;
  role: "admin" | "doctor" | "patient" | "user" | "nurse" | "manager" | "staff" | "labtech" | "reception" | "matron_nurse";
  organizationId: mongoose.Schema.Types.ObjectId;
  username?: string;
  bio?: string;
  urls?: string[];
  image?: string;
  emailVerified?: Date | null;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  provider?: string;
  providerAccountId?: string;
  verified: boolean;
  displaySettings: {
    items: string[];
    language: string;
    timezone: string;
    calendarType?: 'gregorian' | 'hijri';
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
  availabilitySettings: {
    isAvailable: boolean;
    workingHours: {
      monday: { start: string; end: string; enabled: boolean };
      tuesday: { start: string; end: string; enabled: boolean };
      wednesday: { start: string; end: string; enabled: boolean };
      thursday: { start: string; end: string; enabled: boolean };
      friday: { start: string; end: string; enabled: boolean };
      saturday: { start: string; end: string; enabled: boolean };
      sunday: { start: string; end: string; enabled: boolean };
    };
    timeZone: string;
  };
  // Hospital assignment fields
  department?: mongoose.Types.ObjectId;
  ward?: mongoose.Types.ObjectId;
}

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, sparse: true },
    online: { type: Boolean, default: false },
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
      enum: ["admin", "doctor", "nurse", "manager", "staff", "labtech", "reception", "matron_nurse"],
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
      calendarType: { type: String, enum: ['gregorian', 'hijri'], default: 'gregorian' },
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
    availabilitySettings: {
      isAvailable: { type: Boolean, default: true },
      workingHours: {
        monday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: true }
        },
        tuesday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: true }
        },
        wednesday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: true }
        },
        thursday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: true }
        },
        friday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: true }
        },
        saturday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: false }
        },
        sunday: {
          start: { type: String, default: "09:00" },
          end: { type: String, default: "17:00" },
          enabled: { type: Boolean, default: false }
        },
      },
      timeZone: { type: String, default: "UTC" },
    },
    // Hospital assignment fields
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward'
    },
  },
  { timestamps: true }
);

// Access mongoose.models directly to avoid issues with named imports under
// certain bundlers/runtimes (Turbopack/Next.js). Some environments expose
// the models map only on the default mongoose export, so referencing the
// imported `models` can be undefined and cause a runtime TypeError.
const existing = (mongoose && (mongoose as any).models && (mongoose as any).models.User) as Model<IUser> | undefined;
const UserModel: Model<IUser> = existing || mongoose.model<IUser>("User", UserSchema);

export default UserModel;