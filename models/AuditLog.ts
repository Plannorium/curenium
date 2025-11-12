import mongoose, { Schema, models, Document, Model, Types } from "mongoose";

export interface IAuditable {
  _auditContext?: {
    userId: Types.ObjectId;
    userRole: string;
    ip: string;
    meta?: any;
  };
  _previousState?: any;
  _setAuditContext(userId: string, userRole: string, ip: string, meta?: any): void;
}

export interface IAuditLog extends Document {
  orgId?: Types.ObjectId;
  userId?: Types.ObjectId;
  userRole?: string;
  action: string;
  targetType?: string;
  targetId?: Types.ObjectId;
  before?: any;
  after?: any;
  meta?: any;
  ip?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: false },
    userRole: { type: String },
    action: { type: String, required: true }, // e.g. "patient.create", "vital.record", "attachment.upload"
    targetType: { type: String }, // e.g. "Patient", "Vital", "Attachment"
    targetId: { type: Schema.Types.ObjectId, required: false },
    before: { type: Schema.Types.Mixed }, // optional snapshot before change
    after: { type: Schema.Types.Mixed }, // optional snapshot after change
    meta: { type: Schema.Types.Mixed }, // extra context (ip, userAgent, uploadKey, fileUrl)
    ip: { type: String },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false }
);

const AuditLogModel: Model<IAuditLog> =
  models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export function AuditLogPlugin(schema: Schema) {
  schema.methods._setAuditContext = function (
    this: Document & IAuditable,
    userId: string,
    userRole: string,
    ip: string,
    meta?: any
  ) {
    this._auditContext = { userId: new Types.ObjectId(userId), userRole, ip, meta };
  };

  schema.post("save", async function (this: Document & IAuditable) {
    if (!this._auditContext) return;

    const action = this.isNew ? "create" : "update";
    const changedFields = this.isNew
      ? Object.keys(this.toObject())
      : this.modifiedPaths();

    if (changedFields.length === 0 && !this.isNew) return;

    const before: any = {};
    const after: any = {};

    if (!this.isNew && this._previousState) {
      changedFields.forEach((field: string) => {
        before[field] = (this._previousState as any)[field];
        after[field] = this.get(field);
      });
    }

    const model = this.constructor as Model<Document & IAuditable>;

    await AuditLogModel.create({
      userId: this._auditContext.userId,
      userRole: this._auditContext.userRole,
      ip: this._auditContext.ip,
      action: `${model.modelName.toLowerCase()}.${action}`,
      targetType: model.modelName,
      targetId: this._id,
      before: this.isNew ? undefined : before,
      after: this.isNew ? this.toObject() : after,
      meta: this._auditContext.meta,
      orgId: (this as any).orgId,
    });
  });

  schema.pre("save", function (this: Document & IAuditable, next) {
    if (!this.isNew) {
      this._previousState = this.toObject();
    }
    next();
  });
}

export default AuditLogModel;