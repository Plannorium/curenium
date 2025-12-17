import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

const generateRoomId = (seed: string) => {
  if (!seed) throw new Error('Seed is required');
  // Create a simple hash of the seed for uniqueness
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to base36 and take first 8 characters for brevity
  return Math.abs(hash).toString(36).substring(0, 8);
};

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        let channels = await Channel.find({ organizationId: session.user.organizationId });

        // Ensure all channels have roomId
        for (const channel of channels) {
            if (!channel.roomId) {
                channel.roomId = `${channel.name.toLowerCase().replace(/\s+/g, "-")}-${generateRoomId(session.user.organizationId + channel.name)}`;
                await channel.save();
            }
        }

        // Create default 'General' channel if no channels exist
        if (channels.length === 0) {
            const roomId = `general-${generateRoomId(session.user.organizationId + 'General')}`;
            const defaultChannel = new Channel({
                name: 'General',
                organizationId: session.user.organizationId,
                members: [session.user.id],
                isDefault: true,
                roomId,
            });
            await defaultChannel.save();
            channels = [defaultChannel];
        }

        return NextResponse.json({ channels });
    } catch (error) {
        console.error('Error fetching channels:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { name } = await request.json() as { name: string };

        if (!name) {
            return NextResponse.json({ message: 'Channel name is required' }, { status: 400 });
        }

        // Check if channel name already exists in this organization
        const existingChannel = await Channel.findOne({
            name: name.trim(),
            organizationId: session.user.organizationId
        });

        if (existingChannel) {
            return NextResponse.json({ message: 'Channel name already exists in this organization' }, { status: 400 });
        }

        const roomId = `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${generateRoomId(session.user.organizationId + name.trim())}`;

        const newChannel = new Channel({
            name: name.trim(),
            organizationId: session.user.organizationId,
            members: [session.user.id], // Creator is the first member
            roomId,
        });

        await newChannel.save();
        return NextResponse.json(newChannel, { status: 201 });
    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}