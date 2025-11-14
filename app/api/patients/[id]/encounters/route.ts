import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Encounter from "@/models/Encounter";
import Patient, { IPatient } from "@/models/Patient";
import { headers } from "next/headers";
import * as z from "zod";


export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect(); 

  const { id: patientId } = params;

  // Check if patient exists and belongs to the user's organization
  const patient: IPatient | null = await Patient.findOne({
    _id: patientId,
    orgId: session.user.organizationId,
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Patient not found or not accessible" },
      { status: 404 }
    );
  }

  const encounters = await Encounter.find({ patientId }).sort({ createdAt: -1 });

  return NextResponse.json(encounters, { status: 200 });
}

const encounterSchema = z.object({
  type: z.string(),
  date: z.string(),
  provider: z.string(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await paramsPromise;
  await dbConnect();

  const { id: patientId } = params;
  const body = await req.json();

  const validation = encounterSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
  }

  // Check if patient exists and belongs to the user's organization
  const patient: IPatient | null = await Patient.findOne({
    _id: patientId,
    orgId: session.user.organizationId,
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Patient not found or not accessible" },
      { status: 404 }
    );
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  const encounter = new Encounter({
    ...validation.data,
    patientId,
    orgId: session.user.organizationId,
  });

  encounter._setAuditContext(session.user.id, session.user.role, ip);

  await encounter.save();

  return NextResponse.json(encounter, { status: 201 });
}