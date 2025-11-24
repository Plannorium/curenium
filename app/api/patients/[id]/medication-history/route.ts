
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { MedicationHistory } from '@/models/models';
import { IMedicationHistory } from '@/models/MedicationHistory';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const medicationHistory = await MedicationHistory.findOne({ patientId: id, orgId: token.orgId });
    if (!medicationHistory) {
      // If no history exists, create one
      const newMedicationHistory = new MedicationHistory({
        orgId: token.orgId,
        patientId: id,
        entries: [],
      });
      await newMedicationHistory.save();
      return NextResponse.json(newMedicationHistory);
    }
    return NextResponse.json(medicationHistory);
  } catch (error) {
    console.error('Error fetching medication history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body: IMedicationHistory = await req.json();
    const medicationHistory = await MedicationHistory.findOneAndUpdate(
      { patientId: id, orgId: token.orgId },
      { entries: body.entries },
      { new: true, upsert: true }
    );
    return NextResponse.json(medicationHistory);
  } catch (error) {
    console.error('Error updating medication history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}