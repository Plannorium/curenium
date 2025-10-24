import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id).select("organizationId");

  if (!user || !user.organizationId) {
    return NextResponse.json({ error: "User is not part of an organization" }, { status: 404 });
  }

  const org = await Organization.findById(user.organizationId);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  if (org.createdBy.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unverifiedUsers = await User.find({ organizationId: user.organizationId, verified: false });

  return NextResponse.json(unverifiedUsers);
}