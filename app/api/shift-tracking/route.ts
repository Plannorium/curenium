import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import ShiftTracking from '@/models/ShiftTracking';
import Shift from '@/models/Shift';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user');
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const department = searchParams.get('department');

  await dbConnect();

  try {
    const query: any = {
      organization: session.user.organizationId
    };

    // Role-based filtering
    if (session.user.role !== 'admin' && session.user.role !== 'matron_nurse') {
      query.user = session.user.id; // Non-admin users can only see their own shifts
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can create shift schedules
  if (session.user.role !== 'admin' && session.user.role !== 'matron_nurse') {
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
      organization: session.user.organizationId,
      shiftDate: new Date(shiftDate),
      scheduledStart: shiftStart,
      scheduledEnd: shiftEnd,
      department: department || undefined,
      ward: ward || undefined,
      role,
      shiftNotes: shiftNotes?.trim(),
      status: 'scheduled',
      approvedBy: session.user.id
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