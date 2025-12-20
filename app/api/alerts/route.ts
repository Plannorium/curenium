import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Alert from '@/models/Alert';
import Channel from '@/models/Channel';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';
import { pusher } from '../../lib/pusher';

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
        // Match channels where the kebab-case name matches the channel ID
        const channels = await Channel.find({
          organizationId: session.user.organizationId
        }).select('name members');

        const matchingChannels = channels.filter(channel => {
          const kebabName = channel.name.toLowerCase().replace(/\s+/g, '-');
          return channelIds.includes(kebabName);
        });

        const channelMemberIds = matchingChannels.flatMap(channel => channel.members.map(id => id.toString()));
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

    const populatedAlert = await Alert.findById(newAlert._id).populate('createdBy', 'fullName image').lean();

    // Save notifications to DB for each recipient
    const notificationPromises = finalRecipients.map(userId =>
      new Notification({
        userId,
        title: `${level.toUpperCase()} Alert`,
        message,
        type: 'system_alert',
        relatedId: (newAlert as any)._id.toString(),
        sender: {
          _id: (populatedAlert?.createdBy as any)._id,
          fullName: (populatedAlert?.createdBy as any).fullName,
          image: (populatedAlert?.createdBy as any).image,
        },
      }).save()
    );
    await Promise.all(notificationPromises);

    const workerUrl = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8787'
      : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

    if (workerUrl) {
      try {
        await fetch(`${workerUrl}/api/broadcast-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Auth-Key': process.env.WORKER_INTERNAL_AUTH_KEY || '',
          },
          body: JSON.stringify({
            notification: populatedAlert,
            recipients: finalRecipients,
            originalRecipients: recipientIds,
          }),
        });
      } catch (broadcastError) {
        console.error('Failed to broadcast alert to worker:', broadcastError);
      }
    }

    // Trigger Pusher events as fallback
    try {
      for (const userId of finalRecipients) {
        await pusher.trigger(`private-user-${userId}`, 'new-notification', populatedAlert);
      }
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json(populatedAlert, { status: 201 });
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
        const alerts = await Alert.find({ organizationId: session.user.organizationId })
          .populate('createdBy', 'fullName image')
          .sort({ createdAt: -1 })
          .lean();

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("Failed to fetch alerts:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}