import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { ConsentForm } from '@/models/models';
import { IConsentForm } from '@/models/ConsentForm';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string, formId: string }> }) {
  const { id, formId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const consentForm = await ConsentForm.findOne({ _id: formId, patient: id });
  if (!consentForm) {
    return NextResponse.json({ message: 'Consent form not found' }, { status: 404 });
  }
  return NextResponse.json(consentForm);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string, formId: string }> }) {
  const { id, formId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const body: Partial<IConsentForm> = await req.json();
  const updatedConsentForm = await ConsentForm.findOneAndUpdate(
    { _id: formId, patient: id },
    body,
    { new: true, runValidators: true }
  );
  if (!updatedConsentForm) {
    return NextResponse.json({ message: 'Consent form not found' }, { status: 404 });
  }
  return NextResponse.json(updatedConsentForm);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string, formId: string }> }) {
  const { id, formId } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const deletedConsentForm = await ConsentForm.findOneAndDelete({ _id: formId, patient: id });
  if (!deletedConsentForm) {
    return NextResponse.json({ message: 'Consent form not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Consent form deleted successfully' });
}