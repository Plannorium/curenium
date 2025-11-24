
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { DischargeSummary } from '@/models/models';
import { IDischargeSummary } from '@/models/DischargeSummary';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string, summaryId: string }> }) {
  const { id, summaryId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const dischargeSummary = await DischargeSummary.findOne({ _id: summaryId, patient: id });
  if (!dischargeSummary) {
    return NextResponse.json({ message: 'Discharge summary not found' }, { status: 404 });
  }
  return NextResponse.json(dischargeSummary);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string, summaryId: string }> }) {
  const { id, summaryId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const body: Partial<IDischargeSummary> = await req.json();
  const updatedDischargeSummary = await DischargeSummary.findOneAndUpdate(
    { _id: summaryId, patient: id },
    body,
    { new: true, runValidators: true }
  );
  if (!updatedDischargeSummary) {
    return NextResponse.json({ message: 'Discharge summary not found' }, { status: 404 });
  }
  return NextResponse.json(updatedDischargeSummary);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string, summaryId: string }> }) {
  const { id, summaryId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const deletedDischargeSummary = await DischargeSummary.findOneAndDelete({ _id: summaryId, patient: id });
  if (!deletedDischargeSummary) {
    return NextResponse.json({ message: 'Discharge summary not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Discharge summary deleted successfully' });
}