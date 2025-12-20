import { Types } from 'mongoose';

/**
 * Minimal patient interface used for task permission checks.
 * This projection includes only the fields necessary for determining
 * if a user can complete a task based on patient assignments.
 */
export interface IPatientTaskProjection {
  _id: Types.ObjectId;
  ward?: Types.ObjectId;
  assignedNurse?: Types.ObjectId;
}