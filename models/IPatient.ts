import { Types } from 'mongoose';

export interface IPatient {
  _id: Types.ObjectId;
  ward?: Types.ObjectId;
  assignedNurse?: Types.ObjectId;
  // Add other patient properties as needed
}