import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import LabResult, { ILabResult } from "@/models/LabResult";
import { headers } from "next/headers";

// GET a specific lab result
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; labResultId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { labResultId } = params;

  const labResult = await LabResult.findOne({
    _id: labResultId,
    orgId: session.user.organizationId,
  });

  if (!labResult) {
    return NextResponse.json({ message: "Lab result not found" }, { status: 404 });
  }

  return NextResponse.json(labResult, { status: 200 });
}

// UPDATE a lab result
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; labResultId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { labResultId } = params;
  const body = await req.json();

  const labResult: ILabResult | null = await LabResult.findOne({
    _id: labResultId,
    orgId: session.user.organizationId,
  });

  if (!labResult) {
    return NextResponse.json({ message: "Lab result not found" }, { status: 404 });
  }

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  Object.assign(labResult, body);
  labResult._setAuditContext(session.user.id, session.user.role, ip);

  await labResult.save();

  return NextResponse.json(labResult, { status: 200 });
}

// DELETE a lab result (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; labResultId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { labResultId } = params;

  const labResult: ILabResult | null = await LabResult.findOne({
    _id: labResultId,
    orgId: session.user.organizationId,
  });

  if (!labResult) {
    return NextResponse.json({ message: "Lab result not found" }, { status: 404 });
  }

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  labResult.deleted = true;
  labResult._setAuditContext(session.user.id, session.user.role, ip);

  await labResult.save();

  return NextResponse.json(
    { message: "Lab result deleted successfully" },
    { status: 200 }
  );
}