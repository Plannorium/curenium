import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ClinicalNote from '@/models/ClinicalNote';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface ClinicalNoteData {
  content: string;
  visibility?: 'team' | 'private' | 'public';
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['doctor', 'nurse', 'admin', 'matron_nurse'].includes(session.user.role as string)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body: ClinicalNoteData = await req.json();
    const { id } = params;

    const clinicalNote = await ClinicalNote.create({
      patientId: id,
      doctorId: session.user.id,
      orgId: session.user.organizationId,
      content: body.content,
      visibility: body.visibility || 'team',
    });

    return NextResponse.json(clinicalNote, { status: 201 });
  } catch (error) {
    console.error('Error creating clinical note:', error);
    return NextResponse.json({ message: 'Failed to create clinical note' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const clinicalNotes = await ClinicalNote.find({ patientId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(clinicalNotes, { status: 200 });
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    return NextResponse.json({ message: 'Failed to fetch clinical notes' }, { status: 500 });
  }
}