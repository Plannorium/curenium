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
  const body = await req.json();

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
    Object.assign(patient, body);

    patient._setAuditContext(session.user.id, session.user.role, ip);

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

    patient._setAuditContext(session.user.id, session.user.role, ip);

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