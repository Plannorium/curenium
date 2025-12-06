import dbConnect from '@/lib/dbConnect';
import Shift from '@/models/Shift';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

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
  try {
    const user = await authenticateUser(request);
    if (!user || !user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const shifts = await Shift.find({ organization: user.organizationId }).populate(
      'user',
      'fullName image'
    );

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


interface ShiftRequestBody {
  user: string;
  role: string;
  startTime: string;
  endTime: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { user: shiftUser, role, startTime, endTime }: ShiftRequestBody = await req.json();

    if (!shiftUser || !role || !startTime || !endTime) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const userDoc = await User.findById(shiftUser);
    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const initials = userDoc.fullName.split(' ').map((n: string) => n[0]).join('');

    const newShift = new Shift({
      user: shiftUser,
      role,
      startTime,
      endTime,
      status: 'upcoming',
      initials,
      date: new Date(startTime),
      organization: user.organizationId,
    });

    await newShift.save();

    const populatedShift = await Shift.findById(newShift._id).populate(
      'user',
      'fullName image'
    );
    return NextResponse.json(populatedShift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}