
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { NursingNote } from '@/models/models';
import { INursingNote } from '@/models/NursingNote';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string, noteId: string }> }) {
  const { id, noteId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const nursingNote = await NursingNote.findOne({ _id: noteId, patient: id });
  if (!nursingNote) {
    return NextResponse.json({ message: 'Nursing note not found' }, { status: 404 });
  }
  return NextResponse.json(nursingNote);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string, noteId: string }> }) {
  const { id, noteId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const body: Partial<INursingNote> = await req.json();
  const updatedNursingNote = await NursingNote.findOneAndUpdate(
    { _id: noteId, patient: id },
    body,
    { new: true, runValidators: true }
  );
  if (!updatedNursingNote) {
    return NextResponse.json({ message: 'Nursing note not found' }, { status: 404 });
  }
  return NextResponse.json(updatedNursingNote);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string, noteId: string }> }) {
  const { id, noteId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const deletedNursingNote = await NursingNote.findOneAndDelete({ _id: noteId, patient: id });
  if (!deletedNursingNote) {
    return NextResponse.json({ message: 'Nursing note not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Nursing note deleted successfully' });
}