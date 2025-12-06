import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  const user = await authenticateUser(req);

  if (!user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  await dbConnect();

  try {
    const query: any = {
      organizationId: user.organizationId,
    };

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('fullName image id _id role online');

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await authenticateUser(req);

  if (!authUser?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found' }, { status: 401 });
  }

  try {
    const body = await req.json() as { fullName: string, email: string, role: string, password?: string };
    await dbConnect();

    const { password, ...userData } = body;
    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      ...userData,
      passwordHash,
      organizationId: authUser.organizationId,
    });

    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}