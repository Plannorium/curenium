import { authenticateUser } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const userDoc = await User.findById(user.id).select("organizationId");

  if (!userDoc || !userDoc.organizationId) {
    return NextResponse.json({ error: "User is not part of an organization" }, { status: 404 });
  }

  const org = await Organization.findById(userDoc.organizationId);

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

export async function POST(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const userDoc = await User.findById(user.id).select("organizationId");

  if (!userDoc || !userDoc.organizationId) {
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