import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Message from '@/models/Message';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = params.userId;

    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender',
            },
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$lastMessage' },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'senderDetails',
        },
      },
      {
        $unwind: '$senderDetails',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiverDetails',
        },
      },
      {
        $unwind: '$receiverDetails',
      },
      {
        $project: {
          _id: 1,
          text: 1,
          createdAt: 1,
          sender: {
            _id: '$senderDetails._id',
            fullName: '$senderDetails.fullName',
            image: '$senderDetails.image',
          },
          receiver: {
            _id: '$receiverDetails._id',
            fullName: '$receiverDetails.fullName',
            image: '$receiverDetails.image',
          },
        },
      },
    ]);

    return NextResponse.json({ dms: recentMessages });
  } catch (error) {
    console.error('Failed to fetch recent DMs', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}