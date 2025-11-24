import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { CarePlanTemplate } from '@/models/models';
import { ICarePlanTemplate } from '@/models/CarePlanTemplate';

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string; }> }) {
  const { slug } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!['admin', 'doctor', 'nurse'].includes(token.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const carePlanTemplate = await CarePlanTemplate.findOne({ slug });
  if (!carePlanTemplate) {
    return NextResponse.json({ message: 'Care plan template not found' }, { status: 404 });
  }
  return NextResponse.json(carePlanTemplate);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string; }> }) {
  const { slug } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (token.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const body: Partial<ICarePlanTemplate> = await req.json();
  const updatedCarePlanTemplate = await CarePlanTemplate.findOneAndUpdate(
    { slug },
    body,
    { new: true, runValidators: true }
  );
  if (!updatedCarePlanTemplate) {
    return NextResponse.json({ message: 'Care plan template not found' }, { status: 404 });
  }
  return NextResponse.json(updatedCarePlanTemplate);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string; }> }) {
  const { slug } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (token.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const deletedCarePlanTemplate = await CarePlanTemplate.findOneAndDelete({ slug });
  if (!deletedCarePlanTemplate) {
    return NextResponse.json({ message: 'Care plan template not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Care plan template deleted successfully' });
}