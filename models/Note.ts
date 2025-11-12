import mongoose, { Schema, models } from "mongoose" ; 
 
 const NoteSchema = new Schema ( 
   { 
     orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true  }, 
     patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true  }, 
     author: { type: Schema.Types.ObjectId, ref: "User", required: true  }, 
     role: { type: String  }, 
     content: { type: String, required: true  }, 
     visibility: { type: String, enum: ["private", "team", "public"], default: "team"  } 
   }, 
   { timestamps: true  } 
 ); 
 
 export default models.Note || mongoose.model("Note", NoteSchema );