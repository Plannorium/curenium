import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Insurance, { IInsurance } from "@/models/Insurance";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { Model } from "mongoose";

const InsuranceModel = Insurance as Model<IInsurance>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const insurance = await InsuranceModel.find({ patientId: params.id, orgId: session.user.organizationId });
    return NextResponse.json(insurance);
  } catch (error) {
    console.error("Failed to fetch insurance:", error);
    return NextResponse.json({ message: "Failed to fetch insurance" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body: Partial<IInsurance> = await req.json();
    const newInsurance = new InsuranceModel({
      ...body,
      patientId: params.id,
      orgId: session.user.organizationId,
    });
    await newInsurance.save();
    return NextResponse.json(newInsurance, { status: 201 });
  } catch (error) {
    console.error("Failed to create insurance:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}