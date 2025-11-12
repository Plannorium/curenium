import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Encounter, { IEncounter } from "@/models/Encounter";
import { headers } from "next/headers";

// GET a specific encounter
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; encounterId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { encounterId } = params;

  const encounter = await Encounter.findOne({
    _id: encounterId,
    orgId: session.user.organizationId,
  });

  if (!encounter) {
    return NextResponse.json({ message: "Encounter not found" }, { status: 404 });
  }

  return NextResponse.json(encounter, { status: 200 });
}

// UPDATE an encounter
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; encounterId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { encounterId } = params;
  const body = await req.json();

  const encounter: IEncounter | null = await Encounter.findOne({
    _id: encounterId,
    orgId: session.user.organizationId,
  });

  if (!encounter) {
    return NextResponse.json({ message: "Encounter not found" }, { status: 404 });
  }

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  Object.assign(encounter, body);
  encounter._setAuditContext(session.user.id, session.user.role, ip);

  await encounter.save();

  return NextResponse.json(encounter, { status: 200 });
}

// DELETE an encounter (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; encounterId: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { encounterId } = params;

  const encounter: IEncounter | null = await Encounter.findOne({
    _id: encounterId,
    orgId: session.user.organizationId,
  });

  if (!encounter) {
    return NextResponse.json({ message: "Encounter not found" }, { status: 404 });
  }

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  encounter.deleted = true;
  encounter._setAuditContext(session.user.id, session.user.role, ip);

  await encounter.save();

  return NextResponse.json(
    { message: "Encounter deleted successfully" },
    { status: 200 }
  );
}