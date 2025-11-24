import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib//dbConnect";
import Prescription from "@/models/Prescription";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();

  const query: any = { orgId: token.organizationId };
  if (status) {
    query.status = status;
  }

  const prescriptions = await Prescription.find(query)
    .populate("patientId", "firstName lastName")
    .sort({ createdAt: -1 });

  return NextResponse.json(prescriptions);
}