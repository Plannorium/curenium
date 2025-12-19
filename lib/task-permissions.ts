import { IUser } from "@/models/User";
import { ITask } from "@/models/Task";
import { IPatient } from "@/models/IPatient";

export async function canCompleteTask(
  user: IUser,
  task: ITask,
  patient: IPatient
): Promise<boolean> {
  if (!user || !task || !patient) return false;

  const userRole = user.role || [];

  // Admins can do anything
  if (userRole.includes('admin')) {
    return true;
  }

  // The user the task is assigned to can complete it
  if (task.assignedTo && task.assignedTo.toString() === user._id.toString()) {
    return true;
  }

  // For auto-generated tasks (no assignedTo), check based on patient's assigned staff
  if (!task.assignedTo) {
    // The patient's assigned nurse can complete the task
    if (patient.assignedNurse && patient.assignedNurse.toString() === user._id.toString()) {
      return true;
    }

    // A matron nurse from the same ward as the patient can complete the task
    if (userRole.includes('matron_nurse') && user.ward?.toString() === patient.ward?.toString()) {
      return true;
    }
  }

  return false;
}