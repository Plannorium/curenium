import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import { resend } from "@/lib/resendEmail";
import User from "@/models/User";
import mongoose from "mongoose";

interface PatchRequestBody {
  appointmentId: string;
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId } = (await req.json()) as PatchRequestBody;

  try {
    await connectDB();
    const appointment = await Appointment.findById(appointmentId).populate('patientId');

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.orgId.toString() !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    appointment.status = 'confirmed';
    appointment.confirmedBy = session.user.id as any;
    await appointment.save();

    // Send confirmation email to patient
    if (resend) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: (appointment.patientId as any).email,
        subject: "Appointment Confirmed",
        html: `<p>Your appointment for ${appointment.reason} on ${new Date(appointment.date).toLocaleDateString()} at ${new Date(appointment.date).toLocaleTimeString()} has been confirmed.</p>`
      });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to confirm appointment:", error);
    return NextResponse.json({ message: "Failed to confirm appointment" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personnelId = req.nextUrl.searchParams.get("personnelId");

  try {
    await connectDB();
    const query: any = { orgId: session.user.organizationId };

    if (personnelId) {
      query.doctorId = personnelId;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        model: Patient,
        select: 'firstName lastName mrn'
      })
      .populate({
        path: 'doctorId',
        model: User,
        select: 'name'
      })
      .sort({ date: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}