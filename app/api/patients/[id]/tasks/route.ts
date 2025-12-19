import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDB from "@/lib/dbConnect";
import ShiftTracking from "@/models/ShiftTracking";
import Prescription from "@/models/Prescription";
import Patient from "@/models/Patient";
import Task, { ITask as TaskInterface } from "@/models/Task";
import { writeAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

  // Note: in some Next.js runtimes `params` may be a Promise. Await it to
  // support both sync and async param delivery.
  const { id: patientId } = await params as { id: string };
    await connectToDB();

    // 1. Fetch tasks from the new Task collection
    const tasksFromCollection = await Task.find({
      patientId,
      orgId: session.user.organizationId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    }).populate('assignedTo', 'fullName').populate('completedBy', 'fullName');

    // Normalize function: convert DB docs, shift-embedded tasks and generated
    // task objects into a consistent lightweight shape consumed by the UI.
    const normalizeTask = (raw: any) => {
      const obj = raw && typeof raw.toObject === 'function' ? raw.toObject() : raw;
      const patientIdStr = obj?.patientId?._id ? obj.patientId._id.toString() : obj?.patientId ? String(obj.patientId) : undefined;
      const assignedTo = obj?.assignedTo
        ? (typeof obj.assignedTo === 'object' ? { _id: String(obj.assignedTo._id || obj.assignedTo.id), fullName: obj.assignedTo.fullName } : String(obj.assignedTo))
        : undefined;

      return {
        // prefer explicit id, fall back to _id string when available
        id: obj?.id || (obj?._id ? String(obj._id) : undefined),
        _id: obj?._id ? String(obj._id) : undefined,
        orgId: obj?.orgId ? String(obj.orgId) : undefined,
        patientId: patientIdStr,
        title: obj?.title || '',
        description: obj?.description || '',
        type: obj?.type || 'custom',
        dueTime: obj?.dueTime ? new Date(obj.dueTime) : undefined,
        priority: obj?.priority || 'medium',
        status: obj?.status || 'pending',
        notes: obj?.notes || '',
        assignedTo,
        createdAt: obj?.createdAt ? new Date(obj.createdAt) : undefined,
        createdBy: obj?.createdBy ? (obj.createdBy._id ? String(obj.createdBy._id) : String(obj.createdBy)) : undefined,
        prescriptionId: obj?.prescriptionId ? String(obj.prescriptionId) : undefined,
      } as unknown as TaskInterface;
    };

    // Start with normalized DB tasks
    let tasks: TaskInterface[] = tasksFromCollection.map(t => normalizeTask(t));

    // 2. (Backward Compatibility) Fetch tasks from ShiftTracking
    const allShiftsWithPatientTasks = await ShiftTracking.find({
      'tasks.patientId': patientId,
      status: { $in: ['active', 'on_break', 'completed'] },
      shiftDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    }).populate('tasks.patientId', 'firstName lastName mrn')
      .populate('tasks.completedBy', 'fullName')
      .populate('user', 'fullName role');

    allShiftsWithPatientTasks.forEach((shift: any) => {
      shift.tasks.forEach((task: any) => {
        const taskPatientId = task.patientId?._id?.toString() || (task.patientId ? String(task.patientId) : undefined);
        if (taskPatientId === patientId) {
          const norm = normalizeTask(task);
          // attach the shift user as assignedTo if not present
          if (!norm.assignedTo && shift.user) {
            norm.assignedTo = { _id: String(shift.user._id), fullName: shift.user.fullName } as any;
          }

          const key = norm.id || norm._id;
          if (!tasks.some(t => (t.id || t._id) === key)) {
            tasks.push(norm);
          }
        }
      });
    });

    // 3. Get patient's prescriptions for auto-generation
    const prescriptions = await Prescription.find({
      patientId,
      orgId: session.user.organizationId,
      status: { $in: ['active', 'pending'] }
    }).populate('prescribedBy', 'fullName');

    // 4. Get patient info
    const patient = await Patient.findOne({
      _id: patientId,
      orgId: session.user.organizationId
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // 5. Auto-generate tasks from prescriptions
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const prescription of prescriptions) {
      if (prescription.frequency && prescription.dose) {
        const frequencyHours = getFrequencyHours(prescription.frequency);
        if (frequencyHours > 0) {
          let nextDueTime = calculateNextMedicationDueTime(prescription, frequencyHours, now);
          if (nextDueTime <= next24Hours) {
            const existingTask = tasks.find(t =>
              t.prescriptionId?.toString() === prescription._id.toString() &&
              t.type === 'medication' &&
              t.dueTime &&
              Math.abs(new Date(t.dueTime).getTime() - nextDueTime.getTime()) < 300000
            );

            if (!existingTask) {
              const priority = getMedicationPriority(prescription, nextDueTime, now);
              const isOverdue = nextDueTime < now;
              const status = isOverdue ? 'overdue' : 'pending';
              const title = `${isOverdue ? '⚠️ OVERDUE: ' : ''}Administer ${prescription.medication || prescription.medications?.join(', ')}`;
              const taskId = `med-${prescription._id}-${nextDueTime.getTime()}`;

              // Create Task document
              const newTask = new Task({
                id: taskId,
                orgId: session.user.organizationId,
                patientId,
                title,
                description: `${prescription.dose} ${prescription.route || ''} - ${prescription.frequency}${isOverdue ? ' (OVERDUE)' : ''}`,
                type: 'medication',
                priority,
                dueTime: nextDueTime,
                status,
                notes: prescription.instructions || undefined,
                prescriptionId: prescription._id,
                createdBy: session.user.id,
              });
              await newTask.save();

              tasks.push(normalizeTask(newTask));
            }
          }
        }
      }
    }

    // 6. Add standard nursing tasks
    const standardTasks = [
      {
        id: `assessment-${patientId}-${now.getTime()}`,
        title: 'Patient Assessment',
        description: 'Complete comprehensive patient assessment',
        type: 'assessment' as const,
        patientId,
        dueTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        priority: 'high' as const,
        status: 'pending' as const
      },
      {
        id: `rounds-${patientId}-${now.getTime()}`,
        title: 'Patient Rounds',
        description: 'Perform hourly patient rounds',
        type: 'assessment' as const,
        patientId,
        dueTime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
        priority: 'medium' as const,
        status: 'pending' as const
      }
    ];

    for (const task of standardTasks) {
      const norm = normalizeTask(task);
      if (!tasks.some(t => (t.id || t._id) === (norm.id || norm._id))) {
        // Create Task document
        const newTask = new Task({
          id: task.id,
          orgId: session.user.organizationId,
          patientId: task.patientId,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          dueTime: task.dueTime,
          status: task.status,
          createdBy: session.user.id,
        });
        await newTask.save();
        tasks.push(normalizeTask(newTask));
      }
    }

    // 7. Sort tasks
    tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      if (a.dueTime && b.dueTime) {
        return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
      }

      return 0;
    });

    // Audit log for task access
    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'patient.tasks.view',
      targetType: 'Patient',
      targetId: patientId,
      meta: {
        taskCount: tasks.length,
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`
      },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch patient tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch patient tasks" },
      { status: 500 }
    );
  }
}

// (Helper functions remain the same)
function getFrequencyHours(frequency: string): number {
  const freq = frequency.toLowerCase();
  if (freq.includes('q4h')) return 4;
  if (freq.includes('q6h')) return 6;
  if (freq.includes('q8h')) return 8;
  if (freq.includes('q12h')) return 12;
  if (freq.includes('daily')) return 24;
  if (freq.includes('bid')) return 12;
  if (freq.includes('tid')) return 8;
  if (freq.includes('qid')) return 6;
  return 8;
}

function calculateNextMedicationDueTime(prescription: any, frequencyHours: number, currentTime: Date): Date {
  const administrations = prescription.administrations || [];
  if (administrations.length === 0) {
    if (prescription.startDate) {
      const startDate = new Date(prescription.startDate);
      if (startDate > currentTime) return startDate;
      const hoursSinceStart = (currentTime.getTime() - startDate.getTime()) / 3600000;
      const dosesSinceStart = Math.floor(hoursSinceStart / frequencyHours);
      const nextDoseTime = new Date(startDate.getTime() + (dosesSinceStart + 1) * frequencyHours * 3600000);
      return nextDoseTime > currentTime ? nextDoseTime : new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return currentTime;
  }
  const sortedAdmins = administrations
    .filter((admin: any) => admin.administeredAt)
    .sort((a: any, b: any) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime());
  if (sortedAdmins.length === 0) return currentTime;
  const lastAdminTime = new Date(sortedAdmins[0].administeredAt);
  const nextDueTime = new Date(lastAdminTime.getTime() + frequencyHours * 3600000);
  if (nextDueTime <= currentTime) {
    const hoursSinceLastAdmin = (currentTime.getTime() - lastAdminTime.getTime()) / 3600000;
    const missedDoses = Math.floor(hoursSinceLastAdmin / frequencyHours);
    const correctedNextDueTime = new Date(lastAdminTime.getTime() + (missedDoses + 1) * frequencyHours * 3600000);
    if (correctedNextDueTime <= currentTime) {
      return new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return correctedNextDueTime;
  }
  return nextDueTime;
}

function getMedicationPriority(prescription: any, dueTime: Date, now: Date): 'low' | 'medium' | 'high' | 'urgent' {
  const hoursUntilDue = (dueTime.getTime() - now.getTime()) / 3600000;
  if (hoursUntilDue < 0.5) return 'urgent';
  if (hoursUntilDue < 2) return 'high';
  return 'medium';
}