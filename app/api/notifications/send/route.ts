
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface RequestBody {
  userIds: string[];
  notification: any;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userIds, notification } = await request.json() as RequestBody;

    // Remove fields that will be regenerated or replaced.
    const { _id, createdBy, sender: oldSender, ...notificationData } = notification;

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sender = {
      _id: session.user._id,
      fullName: session.user.name,
      image: session.user.image,
    };

    // Create notifications for each user
    const notificationPromises = userIds.map(userId => {
      return Notification.create({
        ...notificationData,
        userId: userId,
        sender: sender,
        link: notification.link,
      });
    });

    const createdNotifications = await Promise.all(notificationPromises);

    const workerUrl = process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8787"
      : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

    if (!workerUrl) {
      return new Response("Worker URL is not configured.", { status: 500 });
    }

    // Broadcast the created notifications
    const broadcastPromises = createdNotifications.map(createdNotification => {
      return fetch(`${workerUrl}/api/broadcast-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Auth-Key": process.env.WORKER_INTERNAL_AUTH_KEY || "",
        },
        body: JSON.stringify({
          notification: createdNotification.toObject(),
          recipients: [createdNotification.userId.toString()],
        }),
      });
    });

    const results = await Promise.all(broadcastPromises);

    results.forEach(res => {
      if (!res.ok) {
        console.error(`Failed to broadcast notification: ${res.statusText}`);
      }
    });

    return NextResponse.json({ message: "Notifications sent" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response("Failed to send notifications", { status: 500 });
  }
}