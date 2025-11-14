import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import LabResult from "@/models/LabResult";

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

  const labResults = await LabResult.find({ patientId }).sort({ createdAt: -1 });

  return NextResponse.json(labResults, { status: 200 });
}

const labResultSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  category: z.string(),
  format: z.string(),
  original_filename: z.string(),
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

  const validation = labResultSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
  }

  const { public_id, secure_url, category, format, original_filename, notes } = validation.data;

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

  const labResult = new LabResult({
    patientId,
    orgId: session.user.organizationId,
    public_id,
    secure_url,
    category,
    format,
    original_filename,
    notes,
  });

  labResult._setAuditContext(session.user.id, session.user.role, ip);

  await labResult.save();

  return NextResponse.json(labResult, { status: 201 });
}