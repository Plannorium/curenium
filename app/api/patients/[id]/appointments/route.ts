import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/dbConnect";
import Appointment, { IAppointment } from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";
import Patient from "@/models/Patient";
import User from "@/models/User";
import mongoose from "mongoose";
import { sendAppointmentConfirmationEmail } from "@/lib/resendEmail";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const appointments = await Appointment.find({ patientId: id, orgId: session.user.organizationId }).sort({ date: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["admin", "receptionist"];
  if (!allowed.includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    patientId: id,
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["doctor", "admin", "staff"];
  if (!allowed.includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body: { appointmentId: string, status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' } = await req.json();
  await connectDB();

  const appointment = await Appointment.findOne({
    _id: body.appointmentId,
    patientId: id,
    orgId: session.user.organizationId,
  });

 if (!appointment) {
   return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
 }

 appointment.status = body.status;
 if (body.status === 'confirmed' && session.user.id) {
   appointment.confirmedBy = session.user.id as any;
 }
 await appointment.save();

 await AuditLog.create({
   orgId: session.user.organizationId,
   userId: session.user.id,
   action: 'appointment.confirm',
   targetId: appointment._id,
   targetType: 'Appointment',
 });

 // Send confirmation email to patient if status is confirmed
 if (body.status === 'confirmed') {
   const patient = await Patient.findById(appointment.patientId);
   const doctor = await User.findById(appointment.doctorId);

   if (patient && patient.contact?.email && doctor) {
     await sendAppointmentConfirmationEmail(
       patient.contact.email,
       `${patient.firstName} ${patient.lastName}`,
       doctor.fullName,
       appointment.date.toISOString(),
       appointment.type
     );
   }
 }

 return NextResponse.json({ ok: true, appointment }, { status: 200 });
}