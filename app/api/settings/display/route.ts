
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

interface DisplaySettings {
  items: string[];
  language: string;
  timezone: string;
}

interface UserWithDisplaySettings {
  displaySettings: DisplaySettings;
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = (await User.findById(session.user.id)
      .select("displaySettings")
      .lean()) as UserWithDisplaySettings | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = { ...user.displaySettings };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching display settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updatedUser = (await User.findByIdAndUpdate(
      session.user.id,
      { displaySettings: body },
      { new: true }
    )
      .select("displaySettings")
      .lean()) as UserWithDisplaySettings | null;

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = { ...updatedUser.displaySettings };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating display settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}