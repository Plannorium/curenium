import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../helpers/auth';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const user = await authenticateUser(request);
    if (!user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        let channels = await Channel.find({ organizationId: user.organizationId });

        // Create default 'General' channel if no channels exist
        if (channels.length === 0) {
            const defaultChannel = new Channel({
                name: 'General',
                organizationId: user.organizationId,
                members: [user.id],
                isDefault: true,
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

export async function POST(request: NextRequest) {
    const user = await authenticateUser(request);
    if (!user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { name } = await request.json() as { name: string };

        if (!name) {
            return NextResponse.json({ message: 'Channel name is required' }, { status: 400 });
        }

        const newChannel = new Channel({
            name,
            organizationId: user.organizationId,
            members: [user.id], // Creator is the first member
        });

        await newChannel.save();
        return NextResponse.json(newChannel, { status: 201 });
    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}