import { IUser as User } from "@/models/User";
import { Patient } from "./patient";

export interface Appointment {
  _id: string;
  patientId: string;
  orgId: string;
  doctorId: string;
  date: string;
  reason: string;
  type: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedAppointment extends Omit<Appointment, 'patientId' | 'doctorId'> {
  patientId: Patient;
  doctorId: User;
}