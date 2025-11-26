import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib//dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";
import { Prescription as PrescriptionType } from "@/types/prescription";

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

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

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body: any = await req.json();
    const { id, ...updateData } = body;

    // If dispensing, automatically set dispensedBy to current user
    if (updateData.dispensed === true && !updateData.dispensedBy) {
      updateData.dispensedBy = token!.id;
    }

    // Convert dispensedAt to Date if it's a string
    if (updateData.dispensedAt && typeof updateData.dispensedAt === 'string') {
      updateData.dispensedAt = new Date(updateData.dispensedAt);
    }

    const prescription = await Prescription.findOne({
      _id: id,
      orgId: token!.organizationId
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Update only the dispensing fields using findOneAndUpdate to avoid validation issues
    const updateFields: any = {
      dispensed: true,
      dispensedBy: token!.id,
    };

    if (updateData.dispensedNotes !== undefined) updateFields.dispensedNotes = updateData.dispensedNotes;
    if (updateData.dispensedAt !== undefined) updateFields.dispensedAt = new Date(updateData.dispensedAt);

    const savedPrescription = await Prescription.findOneAndUpdate(
      { _id: id, orgId: token!.organizationId },
      { $set: updateFields },
      { new: true, runValidators: false } // Skip validation to avoid issues with missing required fields
    );

    await AuditLog.create({
      orgId: token!.organizationId,
      userId: token!.id,
      action: "update_prescription",
      details: `Prescription updated for patient ${savedPrescription.patientId}`,
    });

    return NextResponse.json(savedPrescription);
  } catch (error) {
    console.error("Failed to update prescription:", error);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
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