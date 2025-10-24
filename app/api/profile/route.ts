
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id).select("username bio urls image").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const profileData = {
      username: user.username || "",
      bio: user.bio || "",
      urls: user.urls || [],
      imageUrl: user.image || "",
    };

    return NextResponse.json(profileData, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ message: "Error fetching user data" }, { status: 500 });
  }
}

interface ProfileUpdateBody {
  username?: string;
  bio?: string;
  urls?: (string | { value: string })[];
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await dbConnect();

  const body = (await req.json()) as ProfileUpdateBody;
  const { username, bio } = body;
  const urlsArray = body.urls || [];

  const userId = session.user.id;

  try {
    const update: {
      username?: string;
      bio?: string;
      urls?: string[];
    } = {};

    if (username !== undefined) update.username = username;
    if (bio !== undefined) update.bio = bio;

    // Process and clean the URLs array
    update.urls = urlsArray
      .map((u) => (typeof u === "string" ? u : u?.value))
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    // Try the standard findByIdAndUpdate first and log the result
    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('username bio urls');

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the updated profile fields so client can refresh UI
    return NextResponse.json({ username: user.username || '', bio: user.bio || '', urls: user.urls || [] }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}