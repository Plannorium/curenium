import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import Vital from "@/models/Vital";
import Medication from "@/models/Medication";
import Diagnosis from "@/models/Diagnosis";

export async function GET(
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

  const latestVitals = await Vital.find({ patient: id })
    .sort({ recordedAt: -1 })
    .limit(1);

  const activeMedications = await Medication.find({
    patient: id,
    status: "active",
  });

  const primaryDiagnosis = await Diagnosis.findOne({
    patient: id,
    isPrimary: true,
  }).populate("icd10Code");

  return NextResponse.json({
    ok: true,
    summary: {
      latestVitals: latestVitals[0] || null,
      activeMedications,
      primaryDiagnosis,
    },
  });
}