import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Shift from '@/models/Shift';
import dbConnect from '@/lib/dbConnect';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const shiftId = id;
    const body = await req.json() as { action: string; [key: string]: any };
    const { action, ...data } = body;

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
    }

    // Check permissions - users can only update their own shifts, admins can update any
    if (session.user.role !== 'admin' && shift.user.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case 'clock_in':
        if (shift.status !== 'upcoming') {
          return NextResponse.json({ message: 'Can only clock in to upcoming shifts' }, { status: 400 });
        }
        shift.status = 'on-shift';
        break;

      case 'clock_out':
        if (!['on-shift', 'on-call'].includes(shift.status)) {
          return NextResponse.json({ message: 'Can only clock out from active shifts' }, { status: 400 });
        }
        shift.status = 'upcoming'; // Reset to upcoming after clocking out
        break;

      case 'go_on_call':
        if (shift.status !== 'on-shift') {
          return NextResponse.json({ message: 'Must be on shift to go on call' }, { status: 400 });
        }
        shift.status = 'on-call';
        break;

      case 'go_off_call':
        if (shift.status !== 'on-call') {
          return NextResponse.json({ message: 'Must be on call to go off call' }, { status: 400 });
        }
        shift.status = 'on-shift';
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await shift.save();

    const updatedShift = await Shift.findById(shiftId).populate(
      'user',
      'fullName image'
    );

    return NextResponse.json(updatedShift);
  } catch (_error) {
    console.error('Error updating shift:', _error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}