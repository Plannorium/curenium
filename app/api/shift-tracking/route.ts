import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import ShiftTracking from '@/models/ShiftTracking';
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
            const User = (await import('@/models/User')).default;
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
  const userId = searchParams.get('user');
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const department = searchParams.get('department');

  await dbConnect();

  try {
    const query: any = {
      organization: user.organizationId
    };

    // Role-based filtering
    if (user.role !== 'admin' && user.role !== 'matron_nurse') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // Admins and Matron Nurses can see all shifts in their organization

    if (userId) query.user = userId;
    if (status) query.status = status;
    if (department) query.department = department;

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.shiftDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch only shift tracking records
    const shiftTrackingRecords = await ShiftTracking.find(query)
      .populate('user', 'fullName email role')
      .populate('department', 'name')
      .populate('ward', 'name wardNumber')
      .populate('approvedBy', 'fullName')
      .populate('modifiedBy', 'fullName')
      .sort({ shiftDate: -1, scheduledStart: -1 });

    const allShifts = shiftTrackingRecords;

    // Process shifts to detect missed ones
    const currentTime = new Date();
    const processedShifts = allShifts.map((shift: any) => {
      const shiftObj: any = shift.toObject ? shift.toObject() : { ...shift };

      // Check if shift is missed
      const isScheduledOrNoStatus = shift.status === 'scheduled' || !shift.status;
      const hasPassedStartTime = new Date(shift.scheduledStart) < currentTime;
      const noActualStart = !shift.actualStart;
      const gracePeriod = 30 * 60 * 1000; // 30 minutes grace period
      const isPastGracePeriod = (currentTime.getTime() - new Date(shift.scheduledStart).getTime()) > gracePeriod;

      // Exclude shifts that are already completed, cancelled, or active
      const isActiveShift = ['active', 'on_break', 'completed', 'cancelled', 'absent', 'on_call'].includes(shift.status || '');

      if (isScheduledOrNoStatus && !isActiveShift && hasPassedStartTime && noActualStart && isPastGracePeriod) {
        shiftObj.isMissed = true;
        shiftObj.missedDuration = Math.floor((currentTime.getTime() - new Date(shift.scheduledStart).getTime()) / (1000 * 60)); // minutes late
      } else {
        shiftObj.isMissed = false;
        shiftObj.missedDuration = 0;
      }

      return shiftObj;
    });

    return NextResponse.json(processedShifts, { status: 200 });
  } catch (error) {
    console.error('Error fetching shift tracking:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateUser(req);

  if (!user?.organizationId || !user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can create shift schedules
  if (user.role !== 'admin' && user.role !== 'matron_nurse') {
    return NextResponse.json({ message: 'Forbidden: Only admins can create shift schedules' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json() as {
      userId: string;
      userImage?: string;
      shiftDate: string;
      startTime: string;
      endDate: string;
      endTime: string;
      department?: string;
      ward?: string;
      role: string;
      shiftNotes?: string;
    };

    const { userId, userImage, shiftDate, startTime, endDate, endTime, department, ward, role, shiftNotes } = body;

    if (!userId || !shiftDate || !startTime || !endDate || !endTime || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Construct Date objects from separate date and time fields
    const shiftStart = new Date(`${shiftDate}T${startTime}`);
    const shiftEnd = new Date(`${endDate}T${endTime}`);

    const conflictingShift = await ShiftTracking.findOne({
      user: userId,
      shiftDate: new Date(shiftDate),
      $or: [
        {
          scheduledStart: { $lt: shiftEnd },
          scheduledEnd: { $gt: shiftStart }
        }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictingShift) {
      return NextResponse.json({ message: 'User already has a shift scheduled during this time' }, { status: 409 });
    }

    const newShift = new ShiftTracking({
      user: userId,
      userImage: userImage?.trim(),
      organization: user.organizationId,
      shiftDate: new Date(shiftDate),
      scheduledStart: shiftStart,
      scheduledEnd: shiftEnd,
      department: department || undefined,
      ward: ward || undefined,
      role,
      shiftNotes: shiftNotes?.trim(),
      status: 'scheduled',
      approvedBy: user.id
    });

    await newShift.save();

    const populatedShift = await ShiftTracking.findById(newShift._id)
      .populate('user', 'fullName email role')
      .populate('department', 'name')
      .populate('ward', 'name wardNumber')
      .populate('approvedBy', 'fullName');

    return NextResponse.json(populatedShift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift tracking:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}