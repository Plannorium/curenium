import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDB from "@/lib/dbConnect";
import ShiftTracking from "@/models/ShiftTracking";
import Prescription from "@/models/Prescription";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import { sendWebSocketMessage } from "@/lib/websockets";
import { canDelegateTasks } from "@/lib/rbac";
import mongoose from "mongoose";
import { writeAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Check if user can delegate tasks
    if (!(await canDelegateTasks(req))) {
      return NextResponse.json({ message: "Insufficient permissions to delegate tasks" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json() as { delegatedTo: string; notes?: string };
    const { delegatedTo, notes } = body;

    if (!delegatedTo) {
      return NextResponse.json({ message: "Delegate user ID is required" }, { status: 400 });
    }

    await connectToDB();

    let taskData: any = null;
    let shiftTracking: any = null;
    let taskIndex = -1;

    // First, try to find the task in shift tracking (for persisted tasks)
    shiftTracking = await ShiftTracking.findOne({
      user: session.user.id,
      'tasks.id': taskId
    }).populate('user', 'fullName');

    if (shiftTracking) {
      // Task found in shift tracking
      taskIndex = shiftTracking.tasks.findIndex((task: any) => task.id === taskId);
      if (taskIndex !== -1) {
        taskData = shiftTracking.tasks[taskIndex];
      }
    }

    // If task not found in shift tracking, check if it's a dynamically generated medication task
    if (!taskData && taskId.startsWith('med-')) {
      // Extract prescription ID from task ID (format: med-{prescriptionId}-{timestamp})
      const parts = taskId.split('-');
      if (parts.length >= 3) {
        const prescriptionId = parts[1];
        try {
          const prescription = await Prescription.findOne({
            _id: prescriptionId,
            orgId: session.user.organizationId
          });

          if (prescription) {
            // Find or create Task document for medication tasks
            let task = await Task.findOne({ id: taskId });
            if (!task) {
              task = new Task({
                id: taskId,
                orgId: session.user.organizationId,
                patientId: prescription.patientId,
                title: `Administer ${prescription.medication || prescription.medications?.join(', ')}`,
                description: `${prescription.dose} ${prescription.route || ''} - ${prescription.frequency}`,
                type: 'medication',
                priority: 'medium',
                dueTime: new Date(Date.now() + 60 * 60 * 1000),
                status: 'pending',
                assignedTo: delegatedTo ? new mongoose.Types.ObjectId(delegatedTo) : undefined,
                createdBy: session.user.id,
                prescriptionId: prescription._id,
                notes: notes
              });
              await task.save();
            } else {
              task.assignedTo = delegatedTo ? new mongoose.Types.ObjectId(delegatedTo) : undefined;
              if (notes) task.notes = notes;
              await task.save();
            }
            taskData = task;
          }
        } catch (error) {
          console.warn('Failed to find prescription for medication task:', error);
        }
      }
    }

    if (!taskData) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Update task in shift tracking if it exists there
    if (shiftTracking && taskIndex !== -1) {
      shiftTracking.tasks[taskIndex].delegatedTo = delegatedTo;

      if (notes) {
        shiftTracking.tasks[taskIndex].notes = notes;
      }

      await shiftTracking.save();
    }

    // Create audit log
    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'task.delegate',
      targetType: taskData.type === 'medication' ? 'Task' : 'ShiftTracking',
      targetId: taskData._id?.toString() || (shiftTracking?._id as any)?.toString() || taskId,
      before: { taskId, delegatedTo: null },
      after: { taskId, delegatedTo },
      meta: { taskId, delegatedUserId: delegatedTo, taskType: taskData.type },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    // Create notification for the delegated user
    await Notification.create({
      userId: delegatedTo,
      title: 'Task Delegated',
      message: `${session.user.fullName || 'A colleague'} delegated a task to you: "${taskData.title}"`,
      type: 'system_alert',
      relatedId: taskData._id?.toString() || shiftTracking?._id?.toString() || taskData.prescriptionId?.toString(),
      sender: {
        _id: session.user.id,
        fullName: session.user.fullName || 'Unknown',
        image: session.user.image
      }
    });

    // Send real-time notification via WebSocket
    try {
      sendWebSocketMessage({
        type: 'task_delegated',
        taskId,
        taskTitle: taskData.title,
        delegatedBy: session.user.fullName || 'Unknown',
        delegatedTo
      }, 'general', session.user.token);
    } catch (wsError) {
      console.warn('Failed to send WebSocket notification for task delegation:', wsError);
    }

    return NextResponse.json({
      message: "Task delegated successfully",
      task: taskData
    });
  } catch (error) {
    console.error("Failed to delegate task:", error);
    return NextResponse.json(
      { message: "Failed to delegate task" },
      { status: 500 }
    );
  }
}