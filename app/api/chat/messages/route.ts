
import { NextRequest, NextResponse } from 'next/server';
import Message from '@/models/Message';
import dbConnect from '@/lib/dbConnect';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';
import { getSession } from "next-auth/react";
import { sendWebSocketMessage } from "@/lib/websockets";
import Alert from "@/models/Alert";

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const room = req.nextUrl.searchParams.get('room');

  if (!room) {
    return NextResponse.json({ error: 'Room is required' }, { status: 400 });
  }

  try {
    // Check if user has access to this room (channel or DM)
    // For channels: check membership
    const channel = await mongoose.models.Channel?.findOne({
      _id: room,
      organizationId: token.organizationId,
      $or: [
        { members: token.sub },
        { createdBy: token.sub },
        { type: 'public' }
      ]
    });

    // For DMs: check if user is a participant
    const dmRoom = await mongoose.models.DMRoom?.findOne({
      $or: [
        { room: room, participants: token.sub },
        { _id: room, participants: token.sub }
      ],
      organizationId: token.organizationId
    });

    if (!channel && !dmRoom) {
      return NextResponse.json({ error: 'Access denied: Not a member of this room' }, { status: 403 });
    }

    const messages = await Message.find({ room: room }).sort({ createdAt: 1 }).lean();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messageId = req.nextUrl.searchParams.get('messageId');

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return NextResponse.json({ error: 'Invalid Message ID format' }, { status: 400 });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user has access to the room this message belongs to
    const channel = await mongoose.models.Channel?.findOne({
      _id: message.room,
      organizationId: token.organizationId,
      $or: [
        { members: token.sub },
        { createdBy: token.sub },
        { type: 'public' }
      ]
    });

    const dmRoom = await mongoose.models.DMRoom?.findOne({
      $or: [
        { room: message.room, participants: token.sub },
        { _id: message.room, participants: token.sub }
      ],
      organizationId: token.organizationId
    });

    if (!channel && !dmRoom) {
      return NextResponse.json({ error: 'Access denied: Not a member of this room' }, { status: 403 });
    }

    const isAdmin = token.role === 'admin';
    const isOwner = message.userId.toString() === token.sub;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'You are not authorized to delete this message.' }, { status: 403 });
    }

    message.text = '';
    message.file = undefined;
    message.deleted = {
      by: isAdmin ? (token.name || 'admin') : 'user',
      at: new Date(),
    };

    await message.save();

    // Here you would typically broadcast the deletion to the chat room via WebSockets

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messageId, ...updateData } = await req.json() as { messageId: string; [key: string]: any };

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user has access to the room this message belongs to
    const channel = await mongoose.models.Channel?.findOne({
      _id: message.room,
      organizationId: token.organizationId,
      $or: [
        { members: token.sub },
        { createdBy: token.sub },
        { type: 'public' }
      ]
    });

    const dmRoom = await mongoose.models.DMRoom?.findOne({
      $or: [
        { room: message.room, participants: token.sub },
        { _id: message.room, participants: token.sub }
      ],
      organizationId: token.organizationId
    });

    if (!channel && !dmRoom) {
      return NextResponse.json({ error: 'Access denied: Not a member of this room' }, { status: 403 });
    }

    const isOwner = message.userId.toString() === token.sub;

    if (!isOwner) {
      return NextResponse.json({ error: 'You are not authorized to edit this message.' }, { status: 403 });
    }

    Object.assign(message, updateData);
    await message.save();

    // Here you would typically broadcast the update to the chat room via WebSockets

    return NextResponse.json({ success: true, message: 'Message updated' });
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}


interface AlertMessage {
  type: "alert";
  content: string;
  level: "info" | "warning" | "urgent";
  recipients: string[];
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    const body: unknown = await req.json();

    // For regular messages, check room access
    if (!(body as any).type || (body as any).type !== "alert") {
      const { room } = body as { room?: string };
      if (room) {
        // Check if user has access to this room (channel or DM)
        const channel = await mongoose.models.Channel?.findOne({
          _id: room,
          organizationId: token.organizationId,
          $or: [
            { members: token.sub },
            { createdBy: token.sub },
            { type: 'public' }
          ]
        });

        const dmRoom = await mongoose.models.DMRoom?.findOne({
          $or: [
            { room: room, participants: token.sub },
            { _id: room, participants: token.sub }
          ],
          organizationId: token.organizationId
        });

        if (!channel && !dmRoom) {
          return NextResponse.json({ error: 'Access denied: Not a member of this room' }, { status: 403 });
        }
      }
    }

    if ((body as AlertMessage).type === "alert") {
      const { content, level, recipients } = body as AlertMessage;
      const alert = new Alert({
        content,
        level,
        createdBy: token.sub,
        recipients,
      });
      await alert.save();

      const populatedAlert = await Alert.findById(alert._id).populate(
        "createdBy",
        "name email"
      );

      sendWebSocketMessage({
        type: "alert_notification",
        payload: populatedAlert,
      }, 'default', await getToken({ req, raw: true }));

      return new Response(JSON.stringify(populatedAlert), { status: 201 });
    } else {
      const { content } = body as { content: string };
      const message = new Message({
        message: content,
        userId: token.sub,
        createdAt: new Date(),
      });
  
      await message.save();
  
      return NextResponse.json(message);
    }
  } catch (error) {
    console.error("Failed to process message:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}