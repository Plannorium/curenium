import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

// Add a member to a channel
export async function POST(request: NextRequest, context: { params: { channelId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = await request.json() as { userId: string };
    const { channelId } = context.params;

    // Check if current user has permission to modify this channel
    const channel = await Channel.findOne({
      _id: channelId,
      organizationId: session.user.organizationId,
      $or: [
        { members: session.user.id }, // User is a member
        { createdBy: session.user.id }, // User created the channel
        { type: 'public' } // Public channels can be modified by org members
      ]
    });

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found or access denied' }, { status: 404 });
    }

    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $addToSet: { members: userId } }, // Use $addToSet to avoid duplicates
      { new: true }
    );

    if (!updatedChannel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error('Error adding member to channel:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Remove a member from a channel
export async function DELETE(request: NextRequest, context: { params: { channelId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = await request.json() as { userId: string };
    const { channelId } = context.params;

    // Check if current user has permission to modify this channel
    const channel = await Channel.findOne({
      _id: channelId,
      organizationId: session.user.organizationId,
      $or: [
        { members: session.user.id }, // User is a member
        { createdBy: session.user.id }, // User created the channel
        { type: 'public' } // Public channels can be modified by org members
      ]
    });

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found or access denied' }, { status: 404 });
    }

    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $pull: { members: userId } }, // Use $pull to remove the user
      { new: true }
    );

    if (!updatedChannel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error('Error removing member from channel:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}