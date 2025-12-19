import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDB from "@/lib/dbConnect";
import Task from "@/models/Task";
import Patient from "@/models/Patient";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.role?.includes('matron') && !session.user.role?.includes('admin')) {
      return NextResponse.json({ message: "Insufficient permissions to create tasks" }, { status: 403 });
    }

    const body = await req.json() as {
      patientId: string;
      assignedTo: string;
      title: string;
      description?: string;
      type?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueTime?: string;
      createdBy?: string;
    };

    const {
      patientId,
      assignedTo,
      title,
      description,
      type,
      priority,
      dueTime,
      createdBy
    } = body;

    if (!patientId || !assignedTo || !title) {
      return NextResponse.json({ message: "Patient, assigned user, and title are required" }, { status: 400 });
    }

    await connectToDB();

    const patient = await Patient.findOne({
      _id: patientId,
      orgId: session.user.organizationId
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const assignedUser = await User.findOne({
      _id: assignedTo,
      organizationId: session.user.organizationId,
      role: { $in: ['nurse', 'matron_nurse'] }
    });

    if (!assignedUser) {
      return NextResponse.json({ message: "Assigned user not found or invalid" }, { status: 404 });
    }

    const patientDept = patient.department ? (typeof patient.department === 'object' && patient.department && '_id' in patient.department ? (patient.department as any)._id?.toString() : (patient.department as any)?.toString()) : null;
    const nurseDept = assignedUser.department ? (typeof assignedUser.department === 'object' && assignedUser.department && '_id' in assignedUser.department ? (assignedUser.department as any)._id?.toString() : (assignedUser.department as any)?.toString()) : null;
    const patientWard = patient.ward ? (typeof patient.ward === 'object' && patient.ward && '_id' in patient.ward ? (patient.ward as any)._id?.toString() : (patient.ward as any)?.toString()) : null;
    const nurseWard = assignedUser.ward ? (typeof assignedUser.ward === 'object' && assignedUser.ward && '_id' in assignedUser.ward ? (assignedUser.ward as any)._id?.toString() : (assignedUser.ward as any)?.toString()) : null;

    const canAssign = (patientDept && nurseDept && patientDept === nurseDept) ||
                      (patientWard && nurseWard && patientWard === nurseWard) ||
                      !patient.department;

    if (!canAssign) {
      return NextResponse.json({
        message: "Can only assign tasks to nurses in the same department or ward as the patient"
      }, { status: 403 });
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = new Task({
      id: taskId,
      orgId: session.user.organizationId,
      title,
      description: description || '',
      type: type || 'custom',
      patientId: patient._id,
      assignedTo: assignedUser._id,
      dueTime: dueTime ? new Date(dueTime) : new Date(Date.now() + 60 * 60 * 1000),
      priority: priority || 'medium',
      status: 'pending',
      createdBy: createdBy || session.user.id,
    });

    await newTask.save();

    await Notification.create({
      userId: assignedTo,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}" for patient ${patient.firstName} ${patient.lastName}`,
      type: 'system_alert',
      relatedId: newTask._id.toString(),
      sender: {
        _id: session.user.id,
        fullName: session.user.fullName || 'Unknown',
        image: session.user.image
      }
    });

    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'task.create',
      targetType: 'Task',
      targetId: newTask._id.toString(),
      after: newTask.toObject(),
      meta: {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        assignedTo,
        assignedUserName: assignedUser.fullName
      },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      message: "Task created successfully",
      task: newTask.toObject()
    });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}