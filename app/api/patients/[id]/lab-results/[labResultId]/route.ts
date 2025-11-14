import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import LabResult, { ILabResult } from "@/models/LabResult";
import { headers } from "next/headers";
import * as z from "zod";

// GET a specific lab result
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; labResultId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  
  try {
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
  } catch (error) {
    console.error("Error fetching lab result:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

const labResultUpdateSchema = z.object({
  // Define fields that are allowed to be updated
  notes: z.string().optional(),
  // Add other updatable fields here
}).partial();

// UPDATE a lab result
export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; labResultId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  
  try {
    await dbConnect();

    const { labResultId } = params;
    const body = await req.json();

    const validation = labResultUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    const labResult: ILabResult | null = await LabResult.findOne({
      _id: labResultId,
      orgId: session.user.organizationId,
    });

    if (!labResult) {
      return NextResponse.json({ message: "Lab result not found" }, { status: 404 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "::1";

    Object.assign(labResult, validation.data);
    labResult._setAuditContext(session.user.id, session.user.role, ip);

    await labResult.save();

    return NextResponse.json(labResult, { status: 200 });
  } catch (error) {
    console.error("Error updating lab result:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a lab result (soft delete)
export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; labResultId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  
  try {
    await dbConnect();

    const { labResultId } = params;

    const labResult: ILabResult | null = await LabResult.findOne({
      _id: labResultId,
      orgId: session.user.organizationId,
    });

    if (!labResult) {
      return NextResponse.json({ message: "Lab result not found" }, { status: 404 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "::1";

    labResult.deleted = true;
    labResult._setAuditContext(session.user.id, session.user.role, ip);

    await labResult.save();

    return NextResponse.json(
      { message: "Lab result deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lab result:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}