import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDB from "@/lib/dbConnect";
import Task, { ITask } from "@/models/Task";
import ShiftTracking from "@/models/ShiftTracking";
import Patient from "@/models/Patient";
import { writeAudit } from "@/lib/audit";
import { canCompleteTask } from "@/lib/task-permissions";

interface ShiftTrackingTask {
  id: string;
  patientId: any;
  assignedTo?: any;
  status: string;
  type: string;
  completedAt?: Date | string;
  completedBy?: string | null;
  notes?: string;
  _id?: string;
  title?: string;
}

interface ShiftTrackingDoc {
  _id: any;
  tasks: ShiftTrackingTask[];
  user: { fullName: string };
  save(): Promise<any>;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

  const { taskId } = await params;
    const body = await req.json() as { completedAt?: string; notes?: string };
    const { completedAt, notes } = body;

    await connectToDB();

    let task: ITask | ShiftTrackingTask | null = null;
    let shiftTracking: ShiftTrackingDoc | null = null;
    let taskIndex = -1;

    // First, try to find the task in the Task collection
    task = await Task.findOne({ id: taskId }).populate('assignedTo');

    if (!task) {
      // If not found in Task collection, check ShiftTracking
      shiftTracking = await ShiftTracking.findOne({
        'tasks.id': taskId
      }).populate('user', 'fullName') as ShiftTrackingDoc | null;

      if (shiftTracking) {
        taskIndex = shiftTracking.tasks.findIndex((t: ShiftTrackingTask) => t.id === taskId);
        if (taskIndex !== -1) {
          task = shiftTracking.tasks[taskIndex];
          // Create a virtual task object for permission checking
          task = {
            _id: task._id || taskId,
            id: task.id,
            patientId: task.patientId,
            assignedTo: task.assignedTo,
            status: task.status,
            type: task.type
          };
        }
      }
    }

    if (!task) {
      // Check if it's an auto-generated task
      if (taskId.startsWith('med-')) {
        // Medication task
        const parts = taskId.split('-');
        if (parts.length >= 3) {
          const prescriptionId = parts[1];
          try {
            const Prescription = (await import('@/models/Prescription')).default;
            const prescription = await Prescription.findOne({
              _id: prescriptionId,
              orgId: session.user.organizationId
            });
            if (prescription) {
              // Check if user has access to this patient
              const patient = await Patient.findById(prescription.patientId);
              if (!patient) {
                return NextResponse.json({ message: "Patient not found for this task" }, { status: 404 });
              }

              // Check permission before creating task
              const hasPermission = await canCompleteTask(session.user as any, {
                _id: taskId as any,
                id: taskId,
                patientId: prescription.patientId.toString(),
                assignedTo: undefined as any,
                status: 'pending',
                type: 'medication'
              } as unknown as ITask, patient as any);

              if (!hasPermission) {
                return NextResponse.json({ message: "Forbidden: You do not have permission to complete this task." }, { status: 403 });
              }

              task = new Task({
                id: taskId,
                orgId: session.user.organizationId as any,
                patientId: prescription.patientId as any,
                title: `Administer ${prescription.medication || prescription.medications?.join(', ')}`,
                description: `${prescription.dose} ${prescription.route || ''} - ${prescription.frequency}`,
                type: 'medication',
                priority: 'medium',
                status: 'pending',
                createdBy: session.user.id as any,
                prescriptionId: prescription._id as any,
              });
              await (task as ITask).save();
            }
          } catch (error) {
            console.warn('Failed to find prescription for medication task:', error);
          }
        }
      } else if (taskId.startsWith('assessment-') || taskId.startsWith('rounds-')) {
        // Standard task
        const parts = taskId.split('-');
        if (parts.length >= 3) {
          const patientId = parts[1];
          // Verify patient exists before creating task
          const patient = await Patient.findById(patientId);
          if (!patient) {
            return NextResponse.json({ message: "Patient not found for this task" }, { status: 404 });
          }

          // Check permission before creating task
          const hasPermission = await canCompleteTask(session.user as any, {
            _id: taskId as any,
            id: taskId,
            patientId: patientId,
            assignedTo: undefined as any,
            status: 'pending',
            type: 'assessment'
          } as unknown as ITask, patient as any);

          if (!hasPermission) {
            return NextResponse.json({ message: "Forbidden: You do not have permission to complete this task." }, { status: 403 });
          }

          // Create Task document
          task = new Task({
            id: taskId,
            orgId: session.user.organizationId,
            patientId,
            title: taskId.startsWith('assessment-') ? 'Patient Assessment' : 'Patient Rounds',
            description: taskId.startsWith('assessment-') ? 'Complete comprehensive patient assessment' : 'Perform hourly patient rounds',
            type: 'assessment',
            priority: taskId.startsWith('assessment-') ? 'high' : 'medium',
            status: 'pending',
            createdBy: session.user.id,
          });
          await (task as ITask).save();
        }
      }
    }

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const patient = await Patient.findById(task.patientId).populate('assignedNurse');
    if (!patient) {
      return NextResponse.json({ message: "Patient not found for this task" }, { status: 404 });
    }

    const hasPermission = await canCompleteTask(session.user as any, task as ITask, patient as any);
    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to complete this task." }, { status: 403 });
    }

    if (shiftTracking && taskIndex !== -1) {
      // Update in ShiftTracking
      shiftTracking.tasks[taskIndex].status = 'completed';
      shiftTracking.tasks[taskIndex].completedAt = completedAt || new Date();
      shiftTracking.tasks[taskIndex].completedBy = session.user.id;
      if (notes) {
        shiftTracking.tasks[taskIndex].notes = notes;
      }
      await shiftTracking.save();
    } else {
      // Update in Task collection
      const fullTask = await Task.findOne({ id: taskId });
      if (fullTask) {
        fullTask.status = 'completed';
        fullTask.completedAt = completedAt || new Date();
        fullTask.completedBy = session.user.id;
        if (notes) {
          fullTask.notes = notes;
        }
        await fullTask.save();
        task = fullTask;
      }
    }

    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'task.complete',
      targetType: shiftTracking ? 'ShiftTracking' : 'Task',
      targetId: task?._id?.toString() || shiftTracking?._id?.toString() || taskId,
      meta: {
        patientId: task?.patientId?.toString() || '',
        taskTitle: task!.title || 'Unknown Task',
      },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json(task!);

  } catch (error) {
    console.error("Failed to complete task:", error);
    return NextResponse.json(
      { message: "Failed to complete task" },
      { status: 500 }
    );
  }
}