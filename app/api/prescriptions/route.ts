import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib//dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";
import { Prescription as PrescriptionType } from "@/types/prescription";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();

  const query: any = { orgId: token.organizationId };
  if (status) {
    query.status = status;
  }

  const prescriptions = await Prescription.find(query)
    .populate("patientId", "firstName lastName")
    .sort({ createdAt: -1 });

  return NextResponse.json(prescriptions);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body: Omit<PrescriptionType, '_id' | 'createdAt' | 'updatedAt'> = await req.json();

    const newPrescription = new Prescription({
      ...body,
      createdBy: token.id,
      organizationId: token.organizationId,
    });

    await newPrescription.save();

    await AuditLog.create({
      orgId: token.organizationId,
      userId: token.id,
      action: "create_prescription",
      details: `New prescription created for patient ${body.patientId}`,
    });

    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    console.error("Failed to create prescription:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}