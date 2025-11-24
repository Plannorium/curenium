import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import { ConsentForm } from "@/models/models";
import AuditLog from "@/models/AuditLog";

const allowedRoles = ["admin", "doctor", "nurse"];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!allowedRoles.includes(token.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const patient = await Patient.findById(params.id);

  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const formType = formData.get("formType") as string;
  const signedVia = formData.get("signedVia") as string;

  // In a real application, you would upload the file to a cloud storage
  // provider like AWS S3, Google Cloud Storage, or Azure Blob Storage.
  // For this example, we'll just simulate the upload and use the file details.

  const consent = new ConsentForm({
    orgId: token.orgId,
    patientId: params.id,
    formType: formType,
    version: "1.0", // Or derive from formType
    data: {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    },
    signedBy: token.id,
    signedAt: new Date(),
    signedVia: signedVia,
  });

  await consent.save();

  await AuditLog.create({
    orgId: token.orgId,
    userId: token.id,
    userRole: token.role,
    action: "consent.upload",
    targetType: "ConsentForm",
    targetId: consent._id,
    after: consent.toJSON(),
  });

  return NextResponse.json({ ok: true, consent });
}