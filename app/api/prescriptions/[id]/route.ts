import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

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

  prescription.status = "active";
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const body: { status?: string; statusReason?: string } = await req.json();
  const { status, statusReason } = body;

  if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
    return NextResponse.json({ error: "Invalid prescription ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const prescription = await Prescription.findById(resolvedParams.id);
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    if (status) prescription.status = status;
    if (statusReason !== undefined) prescription.statusReason = statusReason;

    await prescription.save({ validateBeforeSave: false });

    await AuditLog.create({
      orgId: token.organizationId,
      userId: token.id,
      action: "prescription.update",
      targetType: "Prescription",
      targetId: prescription._id,
      details: `Status updated to ${status}`,
    });

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Failed to update prescription:", error);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;

  try {
    await connectDB();
    const prescription = await Prescription.findById(resolvedParams.id)
      .populate("patientId", "firstName lastName")
      .populate("prescribedBy", "fullName")
      .populate("dispensedBy", "fullName")
      .populate("administrations.administeredBy", "fullName")
      .setOptions({ strictPopulate: false });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error(`Failed to fetch prescription ${resolvedParams.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 });
  }
}