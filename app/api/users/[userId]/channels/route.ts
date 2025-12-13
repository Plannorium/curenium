import { authenticateUser } from '@/app/api/helpers/auth';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await authenticateUser(request, userId);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const channels = await Channel.find({
      organizationId: user.organizationId,
      members: userObjectId,
    }).select('name _id');

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching user channels:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}