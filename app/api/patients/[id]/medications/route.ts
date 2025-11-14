import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Medication from "@/models/Medication";
import Patient, { IPatient } from "@/models/Patient";
import { headers } from "next/headers";
import * as z from "zod";

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { id: patientId } = params;

  // Check if patient exists and belongs to the user's organization
  const patient: IPatient | null = await Patient.findOne({
    _id: patientId,
    orgId: session.user.organizationId,
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Patient not found or not accessible" },
      { status: 404 }
    );
  }

  const medications = await Medication.find({ patientId }).sort({ createdAt: -1 });

  return NextResponse.json(medications, { status: 200 });
}

const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  route: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "inactive", "discontinued"]),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { id: patientId } = params;
  const body = await req.json();

  const validation = medicationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid request", errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  // Check if patient exists and belongs to the user's organization
  const patient: IPatient | null = await Patient.findOne({
    _id: patientId,
    orgId: session.user.organizationId,
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Patient not found or not accessible" },
      { status: 404 }
    );
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  const medication = new Medication({
    ...validation.data,
    patientId,
    orgId: session.user.organizationId,
  });

  medication._setAuditContext(session.user.id, session.user.role, ip);

  await medication.save();

  return NextResponse.json(medication, { status: 201 });
}