import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Medication, { IMedication } from "@/models/Medication";
import { headers } from "next/headers";

// GET a specific medication
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; medicationId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { medicationId } = params;

  const medication = await Medication.findOne({
    _id: medicationId,
    orgId: session.user.organizationId,
  });

  if (!medication) {
    return NextResponse.json({ message: "Medication not found" }, { status: 404 });
  }

  return NextResponse.json(medication, { status: 200 });
}

// UPDATE a medication
export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; medicationId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { medicationId } = params;
  const body = await req.json();

  const medication: IMedication | null = await Medication.findOne({
    _id: medicationId,
    orgId: session.user.organizationId,
  });

  if (!medication) {
    return NextResponse.json({ message: "Medication not found" }, { status: 404 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  Object.assign(medication, body);
  medication._setAuditContext(session.user.id, session.user.role, ip);

  await medication.save();

  return NextResponse.json(medication, { status: 200 });
}

// DELETE a medication (soft delete)
export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; medicationId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { medicationId } = params;

  const medication: IMedication | null = await Medication.findOne({
    _id: medicationId,
    orgId: session.user.organizationId,
  });

  if (!medication) {
    return NextResponse.json({ message: "Medication not found" }, { status: 404 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  medication.deleted = true;
  medication._setAuditContext(session.user.id, session.user.role, ip);

  await medication.save();

  return NextResponse.json(
    { message: "Medication deleted successfully" },
    { status: 200 }
  );
}