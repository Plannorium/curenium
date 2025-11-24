import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import LabOrder from "@/models/LabOrder";
import { pusher } from "../../../../lib/pusher";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest, context: any) {
  const { params } = context;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const labOrders = await LabOrder.find({ patientId: params.id, orgId: token.organizationId }).sort({ createdAt: -1 });
    return NextResponse.json(labOrders);
  } catch (error) {
    console.error("Failed to fetch lab orders:", error);
    return NextResponse.json({ message: "Failed to fetch lab orders" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: any
) {
  const { params } = context;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["doctor", "admin"];
  if (!allowed.includes(token.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  await connectDB();

  const labOrder = await LabOrder.create({
    ...body,
    patientId: params.id,
    orgId: token.organizationId,
    doctorId: token.sub || token.id,
  });

  await AuditLog.create({
    orgId: token.organizationId,
    userId: token.sub || token.id,
    action: "laborder.create",
    details: `Lab order ${labOrder._id} created for patient ${params.id}`,
  });

  await pusher.trigger(token.organizationId, "new_lab_order", labOrder);

  return NextResponse.json({ ok: true, labOrder }, { status: 201 });
}