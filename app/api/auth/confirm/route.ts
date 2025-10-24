import { NextResponse } from "next/server";
import connectToDb from "@/lib/dbConnect";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/resendEmail";

interface ConfirmRequest {
  email: string;
  code: string;
}

export async function POST(request: Request) {
  const { email, code }: ConfirmRequest = await request.json();

  if (!email || !code) {
    return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
  }

  await connectToDb();

  const user = await User.findOne({
    email,
    emailVerificationToken: code,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
  }

  user.emailVerified = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.fullName, user.organizationId.toString());

  return NextResponse.json({ message: "Email confirmed successfully" });
}