import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AuditLog from "@/models/AuditLog";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");

  const query: any = { orgId: session.user.organizationId };

  if (targetId) {
    query.targetId = targetId;
  }

  if (targetType) {
    query.targetType = targetType;
  }

  try {
    const auditLogs = await AuditLog.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(auditLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}