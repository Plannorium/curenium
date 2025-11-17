import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import User from "@/models/User";

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