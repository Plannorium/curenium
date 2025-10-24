import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';

interface MessageRequestBody {
  sender?: { id: string; name: string; picture: string };
  userId?: string;
  userName?: string;
  userImage?: string;
  text: string;
  room?: string;
  roomId?: string;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.MONGODB_SAVE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: MessageRequestBody = await req.json();

  try {
    await dbConnect();
    const saved = await Message.create({
      userId: body.sender?.id || body.userId,
      userName: body.sender?.name || body.userName,
      userImage: body.sender?.picture || body.userImage,
      text: body.text,
      room: body.room || body.roomId || "general",
    });
    return NextResponse.json({ ok: true, id: saved._id });
  } catch (err) {
    console.error("save message error", err);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}