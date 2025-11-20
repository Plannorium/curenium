import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Update user's online status
    await User.findByIdAndUpdate(session.user.id, {
      online: true,
      updatedAt: new Date()
    });

    return NextResponse.json({ message: 'Online status updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating online status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Update user's online status to offline
    await User.findByIdAndUpdate(session.user.id, {
      online: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ message: 'Offline status updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating offline status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}