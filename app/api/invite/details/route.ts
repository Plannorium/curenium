import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Invite from "@/models/Invite";
import User from "@/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  await dbConnect();

  const invite = await Invite.findOne({ token });
  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Invite not pending" }, { status: 400 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  const existingUser = await User.findOne({ email: invite.email });

  return NextResponse.json({ isNewUser: !existingUser, email: invite.email });
}