import mongoose, { Schema, models, Model } from "mongoose";
import { IMessage } from "@/types/models"; // Assuming this will be created

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    userName: String,
    userImage: String,
    text: { type: String, required: true },
    to: { type: String },
    file: { type: Object },
    type: { type: String },
    room: { type: String, default: "general" },
    reactions: {
      type: Map,
      of: [{ userId: String, userName: String }],
      default: {},
    },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = models.Message || mongoose.model("Message", MessageSchema);

export default Message;