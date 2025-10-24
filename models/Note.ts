import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  shift: mongoose.Types.ObjectId;
}

const NoteSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  },
  { timestamps: true }
);

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;