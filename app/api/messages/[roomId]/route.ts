import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  context: any
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { roomId } = context.params;
  const userId = session.user.id;

  await dbConnect();

  try {
    let messages;
    // Special handling for "Notes to Self"
    if (roomId === 'self' || roomId === `${userId}-${userId}`) {
      messages = await Message.find({ userId: userId })
        .sort({ createdAt: 'asc' })
        .populate('userId', 'fullName image');
    } else {
      // Existing logic for regular channels
      messages = await Message.find({ channelId: roomId })
        .sort({ createdAt: 'asc' })
        .populate('userId', 'fullName image');
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}