import dbConnect from '@/lib/dbConnect';
import Alert from '@/models/Alert';
import Channel from '@/models/Channel';
import Notification from '@/models/Notification';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pusher } from '../../lib/pusher';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

interface AuthenticatedUser {
  id: string;
  role: string;
  organizationId: string;
  email?: string;
  fullName?: string;
}

async function authenticateUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // First try NextAuth session (for web clients)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return {
        id: session.user.id,
        role: session.user.role || 'user',
        organizationId: session.user.organizationId || '',
        email: session.user.email || undefined,
        fullName: session.user.name || undefined,
      };
    }

    // If no session, try JWT token (for mobile clients)
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

          if (decoded.userId) {
            // Verify user still exists and is active
            const User = (await import('@/models/User')).default;
            const user = await User.findById(decoded.userId).select('role organizationId email fullName verified');
            if (user && user.verified) {
              return {
                id: user._id.toString(),
                role: user.role,
                organizationId: user.organizationId?.toString() || '',
                email: user.email,
                fullName: user.fullName,
              };
            }
          }
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

const alertSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  level: z.enum(['critical', 'urgent', 'info']),
  recipients: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!user?.organizationId) {
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
          organizationId: user.organizationId
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
      organizationId: user.organizationId,
      createdBy: user.id,
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
        relatedId: newAlert._id,
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

export async function GET(request: NextRequest) {
    const user = await authenticateUser(request);
    if (!user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const alerts = await Alert.find({ organizationId: user.organizationId })
          .populate('createdBy', 'fullName image')
          .sort({ createdAt: -1 })
          .lean();

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("Failed to fetch alerts:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}