import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Encounter, { IEncounter } from "@/models/Encounter";
import { headers } from "next/headers";
import * as z from "zod";

// GET a specific encounter
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; encounterId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  try {
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
  } catch (error) {
    console.error("Error fetching encounter:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

const encounterUpdateSchema = z.object({
  type: z.enum(["in-person", "telehealth", "phone"]).optional(),
  date: z.string().datetime().optional(),
  notes: z.array(z.string()).optional(),
  provider: z.string().optional(),
}).partial();

// UPDATE an encounter
export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; encounterId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  try {
    await dbConnect();

    const { encounterId } = params;
    const body = await req.json();

    const validation = encounterUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    const encounter: IEncounter | null = await Encounter.findOne({
      _id: encounterId,
      orgId: session.user.organizationId,
    });

    if (!encounter) {
      return NextResponse.json({ message: "Encounter not found" }, { status: 404 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "::1";

    Object.assign(encounter, validation.data);
    encounter._setAuditContext(session.user.id, session.user.role, ip);

    await encounter.save();

    return NextResponse.json(encounter, { status: 200 });
  } catch (error) {
    console.error("Error updating encounter:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE an encounter (soft delete)
export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; encounterId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  try {
    await dbConnect();

    const { encounterId } = params;

    const encounter: IEncounter | null = await Encounter.findOne({
      _id: encounterId,
      orgId: session.user.organizationId,
    });

    if (!encounter) {
      return NextResponse.json({ message: "Encounter not found" }, { status: 404 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "::1";

    // This assumes a 'deleted' property exists on your model for soft deletes.
    // You should add `deleted?: boolean;` to your IEncounter interface.
    (encounter as any).deleted = true;
    encounter._setAuditContext(session.user.id, session.user.role, ip);

    await encounter.save();

    return NextResponse.json(
      { message: "Encounter deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting encounter:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}