import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NursingCarePlan, { INursingCarePlan } from "@/models/NursingCarePlan";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    const { nurseId, diagnoses, interventions, outcomes, evaluation, status } = body as INursingCarePlan;
    const nursingCarePlan = await NursingCarePlan.create({ patientId: resolvedParams.id, nurseId, diagnoses, interventions, outcomes, evaluation, status });
    return NextResponse.json(nursingCarePlan, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating nursing care plan" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const nursingCarePlans = await NursingCarePlan.find({ patientId: resolvedParams.id }).lean();
    return NextResponse.json(nursingCarePlans, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching nursing care plans" }, { status: 500 });
  }
}