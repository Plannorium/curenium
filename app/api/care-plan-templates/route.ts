
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { CarePlanTemplate } from '@/models/models';
import { ICarePlanTemplate } from '@/models/CarePlanTemplate';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const templates = await CarePlanTemplate.find({ orgId: token.orgId }).populate('createdBy', 'firstName lastName');
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching care plan templates:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body: ICarePlanTemplate = await req.json();
    const newTemplate = new CarePlanTemplate({
      ...body,
      orgId: token.orgId,
      createdBy: token.id,
    });
    await newTemplate.save();
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating care plan template:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}