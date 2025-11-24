
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { NursingNote } from '@/models/models';
import { INursingNote } from '@/models/NursingNote';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const nursingNotes = await NursingNote.find({ patientId: id, orgId: token.orgId }).populate('author', 'firstName lastName');
    return NextResponse.json(nursingNotes);
  } catch (error) {
    console.error('Error fetching nursing notes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body: INursingNote = await req.json();
    const newNursingNote = new NursingNote({
      ...body,
      orgId: token.orgId,
      patientId: id,
      author: token.id,
    });
    await newNursingNote.save();
    return NextResponse.json(newNursingNote, { status: 201 });
  } catch (error) {
    console.error('Error creating nursing note:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}