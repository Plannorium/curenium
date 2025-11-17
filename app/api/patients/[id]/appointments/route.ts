import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/dbConnect";
import Appointment, { IAppointment } from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const appointments = await Appointment.find({ patientId: params.id, orgId: session.user.organizationId }).sort({ date: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["admin", "receptionist"];
  if (!allowed.includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = await paramsPromise;
  const body: { reason: string, type: string, date: string, personnelId: string } = await req.json();
  await connectDB();

  const existingAppointment = await Appointment.findOne({
    doctorId: body.personnelId,
    date: new Date(body.date),
  });

  if (existingAppointment) {
    return NextResponse.json({ error: "The selected health professional is already booked at this time." }, { status: 409 });
  }

  const { personnelId, ...rest } = body;
  const a = await Appointment.create({
    ...rest,
    doctorId: personnelId,
    patientId: params.id,
    orgId: session.user.organizationId,
    createdBy: session.user.id,
  });

  await AuditLog.create({
    orgId: session.user.organizationId,
    userId: session.user.id,
    action: 'appointment.create',
    targetId: a._id,
    targetType: 'Appointment',
  });

  return NextResponse.json({ ok: true, appointment: a }, { status: 201 });
}