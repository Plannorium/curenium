
import { NextRequest, NextResponse } from 'next/server';
import Message from '@/models/Message';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(_req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { 'user.id': session.user.id },
            { to: session.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json(recentMessages);
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return NextResponse.json({ error: 'Failed to fetch recent messages' }, { status: 500 });
  }
}