import mongoose, { Schema, models } from "mongoose";

const ShiftHandoffSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['ward', 'department', 'shift'],
      required: true
    },
    wardId: {
      type: Schema.Types.ObjectId,
      ref: 'Ward'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'ShiftTracking'
    },
    overview: { type: String, required: false, trim: true, default: '' },
    situationsManaged: {
      type: String,
      trim: true,
      default: ''
    },
    incidentsOccurred: {
      type: String,
      trim: true,
      default: ''
    },
    recommendations: {
      type: String,
      trim: true,
      default: ''
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: ''
    },
    voiceRecordings: {
      overview: String,
      situationsManaged: String,
      incidentsOccurred: String,
      recommendations: String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
ShiftHandoffSchema.index({ organizationId: 1, type: 1, createdAt: -1 });
ShiftHandoffSchema.index({ wardId: 1, createdAt: -1 });
ShiftHandoffSchema.index({ departmentId: 1, createdAt: -1 });
ShiftHandoffSchema.index({ createdBy: 1, createdAt: -1 });

export const ShiftHandoff =
  models.ShiftHandoff || mongoose.model("ShiftHandoff", ShiftHandoffSchema);