import mongoose, { Schema, models } from "mongoose" ; 

const MessageSchema = new Schema ( 
  { 
    userId: { type: String, required: true  }, 
    userName: String , 
    userImage: String , 
    text: { type: String, required: true  }, 
    room: { type: String, default: "general"  }, 
  }, 
  { timestamps: true  } 
); 

export const Message  = 
  models.Message || mongoose.model("Message", MessageSchema );