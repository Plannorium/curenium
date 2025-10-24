import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
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

  return NextResponse.json(org);
}

const organizationUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  timezone: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["utc-3", "utc-4", "utc-5", "utc-8", "utc+1"]).optional()
  ),
  language: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["en", "es", "ar"]).optional()
  ),
  activeHoursStart: z.string().optional(),
  activeHoursEnd: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id).select("organizationId");

  if (!user || !user.organizationId) {
    return NextResponse.json({ error: "User is not part of an organization" }, { status: 404 });
  }

  const body = await req.json();
  const validation = organizationUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updatedOrg = await Organization.findByIdAndUpdate(user.organizationId, validation.data, { new: true });

  if (!updatedOrg) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(updatedOrg);
}