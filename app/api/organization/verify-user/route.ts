import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface VerifyUserRequest {
  userId: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId }: VerifyUserRequest = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await dbConnect();

  const adminUser = await User.findById(session.user.id).select("organizationId");

  if (!adminUser || !adminUser.organizationId) {
    return NextResponse.json({ error: "User is not part of an organization" }, { status: 404 });
  }

  const userToVerify = await User.findOne({ _id: userId, organizationId: adminUser.organizationId });

  if (!userToVerify) {
    return NextResponse.json({ error: "User not found in this organization" }, { status: 404 });
  }

  userToVerify.verified = true;
  await userToVerify.save();

  return NextResponse.json({ message: "User verified successfully" });
}