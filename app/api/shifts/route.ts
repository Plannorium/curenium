import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Shift from '@/models/Shift';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const shifts = await Shift.find({ organization: session.user.organizationId }).populate(
      'user',
      'fullName image'
    );

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
   }
}


interface ShiftRequestBody {
  user: string;
  role: string;
  startTime: string;
  endTime: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { user, role, startTime, endTime }: ShiftRequestBody = await req.json();

    if (!user || !role || !startTime || !endTime) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const userDoc = await User.findById(user);
    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const initials = userDoc.fullName.split(' ').map((n: string) => n[0]).join('');

    const newShift = new Shift({
      user,
      role,
      startTime,
      endTime,
      status: 'upcoming',
      initials,
      date: new Date(startTime),
      organization: session.user.organizationId,
    });

    await newShift.save();

    const populatedShift = await Shift.findById(newShift._id).populate(
      'user',
      'fullName image'
    );
    return NextResponse.json(populatedShift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}