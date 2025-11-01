import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const channels = await Channel.find({ organizationId: session.user.organizationId });
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

        const newChannel = new Channel({
            name,
            organizationId: session.user.organizationId,
            members: [session.user.id], // Creator is the first member
        });

        await newChannel.save();
        return NextResponse.json(newChannel, { status: 201 });
    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}