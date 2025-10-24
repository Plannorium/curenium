import mongoose, { Schema, models, Model } from "mongoose";
import { IMessage } from "@/types/models";

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    userName: String,
    userImage: String,
    text: { type: String, required: true },
    room: { type: String, default: "general" },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;