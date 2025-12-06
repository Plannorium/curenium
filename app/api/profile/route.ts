
import { authOptions } from '@/lib/authOptions';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request);

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await dbConnect();

  try {
    const userDoc = await User.findById(user.id).select("username bio urls image").lean();

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const profileData = {
      username: userDoc.username || "",
      bio: userDoc.bio || "",
      urls: userDoc.urls || [],
      imageUrl: userDoc.image || "",
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
  const user = await authenticateUser(req);

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await dbConnect();

  const body = (await req.json()) as ProfileUpdateBody;
  const { username, bio } = body;
  const urlsArray = body.urls || [];

  const userId = user.id;

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
    const userDoc = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('username bio urls');

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the updated profile fields so client can refresh UI
    return NextResponse.json({ username: userDoc.username || '', bio: userDoc.bio || '', urls: userDoc.urls || [] }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}