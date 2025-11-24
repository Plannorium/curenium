import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

interface AdministerRequestBody {
  administeredAt: Date;
  doseAdministered: string;
  notes: string;
  status: 'administered' | 'missed' | 'patient_refused' | 'not_available';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid prescription ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const body: AdministerRequestBody = await req.json();
    const { administeredAt, doseAdministered, notes, status } = body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const administrationRecord = {
      administeredBy: new mongoose.Types.ObjectId(token.id as string),
      administeredAt,
      doseAdministered,
      notes,
      status,
    };

    if (!prescription.administrations) {
      prescription.administrations = [];
    }
    prescription.administrations.push(administrationRecord);
    await prescription.save({ validateBeforeSave: false });

    await AuditLog.create({
      orgId: token.organizationId,
      userId: token.id,
      action: "administer_medication",
      details: `Medication administered for prescription ${id}, status: ${status}`,
    });

    return NextResponse.json(prescription, { status: 200 });
  } catch (error) {
    console.error("Failed to administer medication:", error);
    return NextResponse.json({ error: "Failed to administer medication" }, { status: 500 });
  }
}