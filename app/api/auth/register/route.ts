
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Organization from "@/models/Organization";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  orgName: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { fullName, email, password, orgName }: RegisterRequest = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const organization = new Organization({ name: orgName });
    await organization.save();

    const user = new User({
      fullName,
      email,
      passwordHash,
      role: "admin",
      organizationId: organization._id,
      verified: true,
    });
    await user.save();

    return NextResponse.json({
      message: "Organization and admin created successfully",
      user: {
        email: user.email,
        password,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}