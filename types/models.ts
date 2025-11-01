import { Document } from 'mongoose';

export interface IMessage extends Document {
  userId: string;
  userName?: string;
  userImage?: string;
  text: string;
  to?: string;
  file?: any;
  type?: string;
  room?: string;
  reactions?: {
    [emoji: string]: { userId: string; userName: string }[];
  };
  isPinned?: boolean;
}