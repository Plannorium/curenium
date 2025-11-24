import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import { Prescription as PrescriptionType } from "@/types/prescription";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");

  try {
    await connectDB();
    let query = Prescription.find({ patientId: resolvedParams.id, orgId: session.user.organizationId }).sort({ datePrescribed: -1 });

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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const allowed = ["doctor", "admin"];
  if (!session.user.role || !allowed.includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body: PrescriptionType = await req.json();
  await connectDB();
  const p = await Prescription.create({
    ...body,
    patientId: resolvedParams.id,
    orgId: session.user.organizationId,
    prescribedBy: session.user.id,
  });

  await AuditLog.create({
    orgId: session.user.organizationId,
    userId: session.user.id,
    action: "prescription.create",
    details: `Prescription ${p._id} created for patient ${resolvedParams.id}`,
  });

  return NextResponse.json({ ok: true, prescription: p }, { status: 201 });
}