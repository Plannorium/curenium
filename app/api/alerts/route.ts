import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Alert from '@/models/Alert';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';

const alertSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  level: z.enum(['critical', 'urgent', 'info']),
  recipients: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();
    const body = await request.json();
    const validation = alertSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });
    }

    const { message, level, recipients: recipientIds } = validation.data;

    let finalRecipients: string[] = [];
    if (recipientIds) {
      const userIds = recipientIds.filter(id => !id.startsWith('channel:'));
      const channelIds = recipientIds.filter(id => id.startsWith('channel:')).map(id => id.replace('channel:', ''));

      finalRecipients.push(...userIds);

      if (channelIds.length > 0) {
        // Find all channels by their short ID (e.g., 'emergency') and the org ID
        const channels = await Channel.find({ 
          'name': { $in: channelIds.map(id => id.replace(/-/g, ' ')) }, // Heuristic to match name
          organizationId: session.user.organizationId 
        }).select('members');

        const channelMemberIds = channels.flatMap(channel => channel.members.map(id => id.toString()));
        finalRecipients.push(...channelMemberIds);
      }
    }
    // Remove duplicates
    finalRecipients = [...new Set(finalRecipients)];

    const newAlert = new Alert({
      message,
      level,
      recipients: finalRecipients,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    });

    await newAlert.save();

    // After saving, broadcast to the chat worker
    const workerUrl = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8787'
      : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

    if (workerUrl) {
        try {
            // We need to populate the `createdBy` field to send user details in the chat message
            const populatedAlert = await newAlert.populate('createdBy', 'fullName image');

            await fetch(`${workerUrl}/api/broadcast-alert`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Internal-Auth-Key': process.env.WORKER_INTERNAL_AUTH_KEY || ''
                },
                body: JSON.stringify({
                    alert: populatedAlert.toObject(),
                    recipients: finalRecipients,
                }),
            });
        } catch (broadcastError) {
            console.error('Failed to broadcast alert to chat worker:', broadcastError);
        }
    }

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        // Filter alerts where the current user is a recipient or if recipients list is empty (broadcast)
        const alerts = await Alert.find({ 
          organizationId: session.user.organizationId,
          $or: [{ recipients: { $in: [session.user.id] } }, { recipients: { $size: 0 } }]
        }).sort({ createdAt: -1 }).limit(20);
        return NextResponse.json({ alerts });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}