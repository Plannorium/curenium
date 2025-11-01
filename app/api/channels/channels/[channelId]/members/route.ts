import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Add a member to a channel
export async function POST(request: NextRequest, context: { params: Promise<{ channelId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = await request.json() as { userId: string };
    const { channelId } = await context.params;

    const channel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $addToSet: { members: userId } }, // Use $addToSet to avoid duplicates
      { new: true }
    );

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error adding member to channel:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Remove a member from a channel
export async function DELETE(request: NextRequest, context: { params: Promise<{ channelId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = await request.json() as { userId: string };
    const { channelId } = await context.params;

    const channel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $pull: { members: userId } }, // Use $pull to remove the user
      { new: true }
    );

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error removing member from channel:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}