import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AuditLog from "@/models/AuditLog";
import { authOptions } from "@/lib/authOptions";
import Appointment from "@/models/Appointment";
import Vital from "@/models/Vital";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");
  const patientId = searchParams.get("patientId");

  const query: any = { orgId: session.user.organizationId };

  if (targetId && targetType) {
    query.targetId = targetId;
    query.targetType = targetType;
  } else if (patientId) {
    // If only patientId is provided, fetch all related audit logs
    const patientAppointments = await Appointment.find({ patientId: patientId }).select('_id');
    const patientVitals = await Vital.find({ patientId: patientId }).select('_id');
    
    const appointmentIds = patientAppointments.map(a => a._id);
    const vitalIds = patientVitals.map(v => v._id);

    query.$or = [
      { targetId: patientId },
      { targetId: { $in: appointmentIds } },
      { targetId: { $in: vitalIds } }
    ];
  }

  try {
    const auditLogs = await AuditLog.find(query)
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json(auditLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}