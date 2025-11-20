import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DMRoom from "@/models/DMRoom";
import User from "@/models/User";
import Message from "@/models/Message";
import "@/models/Message"; 
import connectToDb from "@/lib/dbConnect";

interface PostRequestBody {
  receiverId: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDb();
    const { userId } = await context.params;
    const { receiverId } = (await request.json()) as PostRequestBody;

    if (!userId || !receiverId) {
      return NextResponse.json(
        { message: "Missing sender or receiver ID" },
        { status: 400 }
      );
    }

    const room = [userId, receiverId].sort().join("--");

    // Check if a DM room already exists
    let dmRoom = await DMRoom.findOne({ room }).populate(
      "participants",
      "fullName image email"
    );

    if (!dmRoom) {
      // Create a new DM room
      const newDmRoom = new DMRoom({
        room,
        participants: [userId, receiverId],
      });
      await newDmRoom.save();

      dmRoom = await DMRoom.findById(newDmRoom._id).populate(
        "participants",
        "fullName image email"
      );
    }

    return NextResponse.json({ dm: dmRoom }, { status: 201 });
  } catch (error) {
    console.error("Error creating or fetching DM:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { userId } = await context.params;

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDb();

    const dms = await DMRoom.find({ participants: userId })
      .populate({
        path: "participants",
        select: "fullName image email",
      })
      .populate("messages");

    return NextResponse.json({ dms: dms || [] });
  } catch (error) {
    console.error("Failed to fetch recent DMs", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}