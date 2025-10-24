import mongoose, { Document } from 'mongoose';

export interface IMessage extends Document {
  room: string;
  text: string;
  userId: string;
  userName?: string;
  userImage?: string;
  createdAt: Date;
  updatedAt: Date;
}