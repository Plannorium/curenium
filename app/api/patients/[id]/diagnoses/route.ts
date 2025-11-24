import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import Diagnosis from "@/models/Diagnosis";
import AuditLog from "@/models/AuditLog";

const diagnosisSchema = z.object({
  note: z.string().optional(),
  isPrimary: z.boolean().optional(),
  icd10Code: z.string(),
  description: z.string(),
  severity: z.string(),
  onsetDate: z.string(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  const { id } = await context.params;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["doctor", "nurse", "clinical_manager"];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const patient = await Patient.findById(id);
  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const body = await req.json();
  const validation = diagnosisSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.issues },
      { status: 400 }
    );
  }

  const diagnosis = new Diagnosis({
    patientId: patient._id,
    diagnosisCode: validation.data.icd10Code,
    description: validation.data.description,
    severity: validation.data.severity,
    onsetDate: new Date(validation.data.onsetDate),
    note: validation.data.note,
    isPrimary: validation.data.isPrimary,
    documentedBy: token.id,
    orgId: token.orgId,
  });

  await diagnosis.save();

  await AuditLog.create({
    orgId: token.orgId,
    userId: token.id,
    action: "diagnosis.create",
    targetId: diagnosis._id,
    targetType: "Diagnosis",
  });

  return NextResponse.json({ ok: true, diagnosis });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const diagnoses = await Diagnosis.find({ patientId: id, orgId: token.orgId }).populate('documentedBy', 'firstName lastName');
    return NextResponse.json(diagnoses);
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}