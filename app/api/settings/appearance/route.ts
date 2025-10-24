
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

interface AppearanceSettings {
  theme: string;
  font: string;
}

interface UserWithAppearanceSettings {
  appearanceSettings: AppearanceSettings;
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = (await User.findById(session.user.id)
      .select("appearanceSettings")
      .lean()) as UserWithAppearanceSettings | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { appearanceSettings } = user;

    return NextResponse.json({
      theme: appearanceSettings?.theme || "light",
      font: appearanceSettings?.font || "inter",
    });
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
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
      { appearanceSettings: body },
      { new: true }
    )
      .select("appearanceSettings")
      .lean()) as UserWithAppearanceSettings | null;

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { appearanceSettings } = updatedUser;

    return NextResponse.json({
      theme: appearanceSettings.theme,
      font: appearanceSettings.font,
    });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}