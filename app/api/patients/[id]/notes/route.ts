import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";
import Note from "@/models/Note";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  const { id } = await context.params;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["doctor", "nurse", "clinical_manager"];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const patient = await Patient.findById(id);

  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const notes = await Note.find({ patient: id }).sort({ createdAt: -1 });

  return NextResponse.json({
    ok: true,
    notes,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  const { id } = await context.params;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["doctor", "nurse"];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const validation = noteSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  await dbConnect();

  const patient = await Patient.findById(id);

  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const note = new Note({
    ...validation.data,
    patient: id,
    createdBy: token.sub,
  });

  await note.save();

  return NextResponse.json({ ok: true, note }, { status: 201 });
}