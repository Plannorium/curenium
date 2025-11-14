import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import { Prescription as PrescriptionType } from "@/types/prescription"; 
 
 export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["doctor"];
  if (!allowed.includes(token.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = await paramsPromise;
  const body: PrescriptionType = await req.json();
  await connectDB();
  const p = await Prescription.create({
    ...body,
    patientId: params.id,
    orgId: token.orgId, // Assuming orgId is in the token
    prescribedBy: token.sub || token.id,
  });
  return NextResponse.json({ ok: true, prescription: p }, { status: 201 });
}