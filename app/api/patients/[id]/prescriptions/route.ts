import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import { Prescription as PrescriptionType } from "@/types/prescription";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");

  try {
    await connectDB();
    let query = Prescription.find({ patientId: params.id, orgId: token.orgId }).sort({ datePrescribed: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const prescriptions = await query.exec();
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return NextResponse.json({ message: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["doctor"];
  if (!token.role || !allowed.includes(token.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body: PrescriptionType = await req.json();
  await connectDB();
  const p = await Prescription.create({
    ...body,
    patientId: params.id,
    orgId: token.orgId, // Assuming orgId is in the token
    prescribedBy: token.sub || token.id,
  });

  await AuditLog.create({
    orgId: token.orgId,
    userId: token.sub || token.id,
    action: "prescription.create",
    details: `Prescription ${p._id} created for patient ${params.id}`,
  });

  return NextResponse.json({ ok: true, prescription: p }, { status: 201 });
}