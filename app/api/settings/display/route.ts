
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

interface DisplaySettings {
  items: string[];
  language: string;
  timezone: string;
  calendarType?: 'gregorian' | 'hijri';
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

    const settings = {
      ...user.displaySettings,
      calendarType: user.displaySettings?.calendarType ?? 'gregorian'
    };

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

    const { items, language, timezone, calendarType }: DisplaySettings = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          "displaySettings.items": items,
          "displaySettings.language": language,
          "displaySettings.timezone": timezone,
          "displaySettings.calendarType": calendarType,
        },
      },
      { new: true, runValidators: true }
    )
      .select("displaySettings")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = {
      ...updatedUser.displaySettings,
      calendarType: updatedUser.displaySettings?.calendarType ?? 'gregorian'
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating display settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}