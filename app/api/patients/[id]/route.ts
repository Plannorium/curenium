import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient, { IPatient } from "@/models/Patient";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { Document } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  await dbConnect();
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: patientId } = params;

  try {
    const patient = await Patient.findOne({
      _id: patientId,
      orgId: session.user.organizationId,
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return NextResponse.json(
      { message: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  await dbConnect();
  const session = await getSession();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: patientId } = params;
  const body: Record<string, any> = await req.json();

  try {
    const patient: (IPatient & Document) | null = await Patient.findOne({
      _id: patientId,
      orgId: session.user.organizationId,
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // Update patient fields
    patient.set(body);

    // Set audit context for tracking changes
    if (typeof (patient as any)._setAuditContext === 'function') {
      patient._setAuditContext(session.user.id, session.user.role, ip, { action: 'Patient Assignment Update' });
    }

    await patient.save();

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error("Failed to update patient:", error);
    return NextResponse.json(
      { message: "Failed to update patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  await dbConnect();
  const session = await getSession();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: patientId } = params;

  try {
    const patient: (IPatient & Document) | null = await Patient.findOne({
      _id: patientId,
      orgId: session.user.organizationId,
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // Soft delete
    patient.deleted = true;

    // Set audit context for tracking changes
    if (typeof (patient as any)._setAuditContext === 'function') {
      patient._setAuditContext(session.user.id, session.user.role, ip);
    } else {
      // Fallback: manually set audit fields if plugin method is not available
      (patient as any)._auditUser = session.user.id;
      (patient as any)._auditUserRole = session.user.role;
      (patient as any)._auditBefore = (patient as any)._previousState || null;
      (patient as any)._auditMeta = { ip };
    }

    await patient.save();

    return NextResponse.json(
      { message: "Patient deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete patient:", error);
    return NextResponse.json(
      { message: "Failed to delete patient" },
      { status: 500 }
    );
  }
}