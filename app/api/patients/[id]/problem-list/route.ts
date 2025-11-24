
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { ProblemList } from '@/models/models';
import { IProblemList } from '@/models/ProblemList';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const problemList = await ProblemList.findOne({ patientId: id, orgId: token.orgId }).populate('problems.notedBy', 'firstName lastName');
    if (!problemList) {
        // If no problem list exists, create one
        const newProblemList = new ProblemList({
            orgId: token.orgId,
            patientId: id,
            problems: [],
        });
        await newProblemList.save();
        return NextResponse.json(newProblemList);
    }
    return NextResponse.json(problemList);
  } catch (error) {
    console.error('Error fetching problem list:', error);
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
    const body: IProblemList = await req.json();
    const problemList = await ProblemList.findOneAndUpdate(
      { patientId: id, orgId: token.orgId },
      { problems: body.problems },
      { new: true, upsert: true }
    );
    return NextResponse.json(problemList);
  } catch (error) {
    console.error('Error updating problem list:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}