import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";

interface PutRequestBody {
  notes?: string;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["pharmacist", "admin"];
  if (!token.role || !allowed.includes(token.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: PutRequestBody = await req.json();

  await connectDB();

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
  }

  const before = { ...prescription.toObject() };
  const userId = token.sub || token.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in token" }, { status: 400 });
  }

  prescription.status = "completed";
  prescription.dispensedBy = userId;
  prescription.dispensedNotes = body.notes;

  await prescription.save();

  await AuditLog.create({
    orgId: token.organizationId,
    userId: userId,
    action: "prescription.dispense",
    targetType: "Prescription",
    targetId: prescription._id,
    before,
    after: prescription.toObject(),
  });

  return NextResponse.json(prescription);
}