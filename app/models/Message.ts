import mongoose, { Schema, models } from "mongoose";

const MessageSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: String,
    userImage: String,
    text: { type: String, required: true },
    room: { type: String, default: "general" },
    reactions: {
      type: Map,
      of: [{
        userId: String,
        userName: String,
      }],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Message =
  models.Message || mongoose.model("Message", MessageSchema);