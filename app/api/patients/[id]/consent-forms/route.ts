
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { ConsentForm } from '@/models/models';
import { IConsentForm } from '@/models/ConsentForm';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const consentForms = await ConsentForm.find({ patientId: id, orgId: token.orgId }).populate('signedBy', 'firstName lastName');
    return NextResponse.json(consentForms);
  } catch (error) {
    console.error('Error fetching consent forms:', error);
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
    const body: IConsentForm = await req.json();
    const newConsentForm = new ConsentForm({
      ...body,
      orgId: token.orgId,
      patientId: id,
    });
    await newConsentForm.save();
    return NextResponse.json(newConsentForm, { status: 201 });
  } catch (error) {
    console.error('Error creating consent form:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}