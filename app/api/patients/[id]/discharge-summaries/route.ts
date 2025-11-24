
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { DischargeSummary } from '@/models/models';
import { IDischargeSummary } from '@/models/DischargeSummary';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const dischargeSummaries = await DischargeSummary.find({ patientId: id, orgId: token.orgId }).populate('author', 'firstName lastName').populate('signedBy', 'firstName lastName');
    return NextResponse.json(dischargeSummaries);
  } catch (error) {
    console.error('Error fetching discharge summaries:', error);
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
    const body: IDischargeSummary = await req.json();
    const newDischargeSummary = new DischargeSummary({
      ...body,
      orgId: token.orgId,
      patientId: id,
      author: token.id,
    });
    await newDischargeSummary.save();
    return NextResponse.json(newDischargeSummary, { status: 201 });
  } catch (error) {
    console.error('Error creating discharge summary:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}