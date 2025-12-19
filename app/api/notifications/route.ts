import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

interface PatchBody {
  notificationId?: string;
  read?: boolean;
  markAll?: boolean;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { notificationId, read, markAll }: PatchBody = await request.json();

  await dbConnect();
  try {
    if (markAll) {
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true }
      );
    } else if (read !== undefined && notificationId) {
      // If notificationId is a valid ObjectId, find by _id, else find by relatedId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(notificationId);
      const query = isObjectId ? { _id: notificationId } : { relatedId: notificationId };

      await Notification.findOneAndUpdate(
        { ...query, userId: session.user.id },
        { read }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// This is a placeholder for the notification sending logic.
// In a real application, this would be triggered by events in your system.
export async function POST(request: Request) {
  const body = await request.json();

  // Here you would typically have logic to determine who to send the notification to.
  // For now, we'll just log it to the console.
  console.log("Sending notification:", body);

  // You would then use a WebSocket server to push the notification to the client.
  // This is just a placeholder and won't actually send a notification.

  return NextResponse.json({ success: true, message: "Notification sent" });
}