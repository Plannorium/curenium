import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { Allergy } from '@/models/models';
import { IAllergy } from '@/models/Allergy';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const allergies = await Allergy.find({ patientId: id, orgId: token.orgId }).populate('notedBy', 'firstName lastName');
    return NextResponse.json(allergies);
  } catch (error) {
    console.error('Error fetching allergies:', error);
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
    const body: IAllergy = await req.json();
    const newAllergy = new Allergy({
      ...body,
      orgId: token.orgId,
      patientId: id,
      notedBy: token.id,
    });
    await newAllergy.save();
    return NextResponse.json(newAllergy, { status: 201 });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}