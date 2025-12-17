import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

// Add a member to a channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    console.log('Authorization failed: Missing session data');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = (await request.json()) as { userId: string };
    const { channelId } = await params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // First, find the channel to check if it exists and user has access
    const channel = await Channel.findOne({
      _id: channelId,
      organizationId: session.user.organizationId
    });

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    // Check if current user has permission to modify this channel
    const userIsMember = channel.members.some(member => member.toString() === session.user.id);
    const isDefaultChannel = channel.isDefault;

    // Allow if user is a member OR if it's a default channel (like "General")
    if (!userIsMember && !isDefaultChannel) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Check if user being added is in the same organization (you might want to add this validation)
    // For now, we'll trust that the userId is valid

    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $addToSet: { members: new mongoose.Types.ObjectId(userId) } }, // Use $addToSet to avoid duplicates
      { new: true }
    );

    if (!updatedChannel) {
      return NextResponse.json({ message: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json(updatedChannel);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Remove a member from a channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = (await request.json()) as { userId: string };
    const { channelId } = await params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // First, find the channel to check if it exists and user has access
    const channel = await Channel.findOne({
      _id: channelId,
      organizationId: session.user.organizationId
    });

    if (!channel) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
    }

    // Check if current user has permission to modify this channel
    const userIsMember = channel.members.some(member => member.toString() === session.user.id);
    const isDefaultChannel = channel.isDefault;

    // Allow if user is a member OR if it's a default channel
    if (!userIsMember && !isDefaultChannel) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId, organizationId: session.user.organizationId },
      { $pull: { members: new mongoose.Types.ObjectId(userId) } }, // Use $pull to remove the user
      { new: true }
    );

    if (!updatedChannel) {
      return NextResponse.json({ message: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json(updatedChannel);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}