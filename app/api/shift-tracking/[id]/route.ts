import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import ShiftTracking from '@/models/ShiftTracking';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const shift = await ShiftTracking.findOne({
      _id: id,
      organization: session.user.organizationId
    })
    .populate('user', 'fullName email role')
    .populate('department', 'name')
    .populate('ward', 'name wardNumber')
    .populate('approvedBy', 'fullName')
    .populate('modifiedBy', 'fullName');

    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
    }

    // Check permissions - users can view their own shifts, admins can view all
    if (session.user.role !== 'admin' && shift.user.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden: You can only view your own shifts' }, { status: 403 });
    }

    return NextResponse.json(shift, { status: 200 });
  } catch (error) {
    console.error('Error fetching shift:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const body = await req.json() as {
      action: 'clock_in' | 'clock_out' | 'start_break' | 'end_break' | 'go_on_call' | 'go_off_call' | 'update_notes' | 'cancel' | 'modify' | 'mark_absent';
      breakType?: 'lunch' | 'rest' | 'meeting' | 'emergency' | 'other';
      breakNotes?: string;
      shiftNotes?: string;
      handoverNotes?: string;
      morningReport?: string;
      eveningReport?: string;
      tasksCompleted?: number;
      incidentsReported?: number;
      patientInteractions?: number;
      location?: string;
      modificationReason?: string;
      onCallNotes?: string;
    };

    const shift = await ShiftTracking.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = shift.user.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { action, ...data } = body;
    const now = new Date();

    switch (action) {
      case 'clock_in':
        // Allow any user to clock in to their own shift
        if (!isOwner) return NextResponse.json({ message: 'Forbidden: You can only clock in to your own shifts' }, { status: 403 });
        if (shift.status !== 'scheduled') {
          return NextResponse.json({ message: 'Cannot clock in to this shift' }, { status: 400 });
        }
        shift.status = 'active';
        shift.actualStart = now;
        shift.loginEvents.push({
          timestamp: now,
          action: 'login',
          location: data.location
        });
        break;

      case 'clock_out':
        // Allow any user to clock out of their own shift
        if (!isOwner) return NextResponse.json({ message: 'Forbidden: You can only clock out of your own shifts' }, { status: 403 });
        if (shift.status !== 'active' && shift.status !== 'on_break') {
          return NextResponse.json({ message: 'Cannot clock out of this shift' }, { status: 400 });
        }
        shift.status = 'completed';
        shift.actualEnd = now;
        shift.loginEvents.push({
          timestamp: now,
          action: 'logout',
          location: data.location
        });
        break;

      case 'start_break':
        // Allow any user to start breaks on their own shift
        if (!isOwner) return NextResponse.json({ message: 'Forbidden: You can only manage breaks on your own shifts' }, { status: 403 });
        if (shift.status !== 'active') {
          return NextResponse.json({ message: 'Cannot start break in current shift status' }, { status: 400 });
        }
        shift.status = 'on_break';
        shift.breaks.push({
          type: data.breakType || 'rest',
          startTime: now,
          notes: data.breakNotes?.trim()
        });
        shift.loginEvents.push({
          timestamp: now,
          action: 'break_start',
          notes: data.breakNotes
        });
        break;

      case 'end_break':
        // Allow any user to end breaks on their own shift
        if (!isOwner) return NextResponse.json({ message: 'Forbidden: You can only manage breaks on your own shifts' }, { status: 403 });
        if (shift.status !== 'on_break') {
          return NextResponse.json({ message: 'Not currently on break' }, { status: 400 });
        }
        const currentBreak = shift.breaks[shift.breaks.length - 1];
        if (currentBreak && !currentBreak.endTime) {
          currentBreak.endTime = now;
          currentBreak.duration = Math.round((now.getTime() - currentBreak.startTime.getTime()) / (1000 * 60)); // minutes
        }
        shift.status = 'active';
        shift.loginEvents.push({
          timestamp: now,
          action: 'break_end'
        });
        break;

      case 'update_notes':
        if (!isOwner && !isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        if (data.shiftNotes !== undefined) shift.shiftNotes = data.shiftNotes.trim();
        if (data.handoverNotes !== undefined) shift.handoverNotes = data.handoverNotes.trim();
        if (data.morningReport !== undefined) shift.morningReport = data.morningReport.trim();
        if (data.eveningReport !== undefined) shift.eveningReport = data.eveningReport.trim();
        if (data.tasksCompleted !== undefined) shift.tasksCompleted = data.tasksCompleted;
        if (data.incidentsReported !== undefined) shift.incidentsReported = data.incidentsReported;
        if (data.patientInteractions !== undefined) shift.patientInteractions = data.patientInteractions;
        break;

      case 'cancel':
        if (!isAdmin) return NextResponse.json({ message: 'Forbidden: Only admins can cancel shifts' }, { status: 403 });
        shift.status = 'cancelled';
        shift.modifiedBy = session.user.id as any;
        shift.modificationReason = data.modificationReason;
        break;

      case 'modify':
        if (!isAdmin) return NextResponse.json({ message: 'Forbidden: Only admins can modify shifts' }, { status: 403 });
        // Allow admin to modify shift details
        if (data.modificationReason) shift.modificationReason = data.modificationReason;
        shift.modifiedBy = session.user.id as any;
        break;

      case 'go_on_call':
        // Allow any user to go on call (can be done during or outside regular shifts)
        if (!isOwner && !isAdmin) return NextResponse.json({ message: 'Forbidden: You can only manage on-call status for your own shifts' }, { status: 403 });
        shift.status = 'on_call';
        shift.onCallStart = now;
        shift.onCallNotes = data.onCallNotes?.trim();
        shift.loginEvents.push({
          timestamp: now,
          action: 'on_call_start',
          notes: data.onCallNotes
        });
        break;

      case 'go_off_call':
        // Allow any user to go off call
        if (!isOwner && !isAdmin) return NextResponse.json({ message: 'Forbidden: You can only manage on-call status for your own shifts' }, { status: 403 });
        if (shift.status !== 'on_call') {
          return NextResponse.json({ message: 'Not currently on call' }, { status: 400 });
        }
        shift.status = shift.actualStart ? 'active' : 'scheduled'; // Return to previous status
        if (shift.onCallStart) {
          shift.onCallDuration = Math.round((now.getTime() - shift.onCallStart.getTime()) / (1000 * 60)); // minutes
        }
        shift.onCallEnd = now;
        shift.loginEvents.push({
          timestamp: now,
          action: 'on_call_end'
        });
        break;

      case 'mark_absent':
        if (!isAdmin) return NextResponse.json({ message: 'Forbidden: Only admins can mark shifts as absent' }, { status: 403 });
        shift.status = 'absent';
        shift.modifiedBy = session.user.id as any;
        shift.modificationReason = 'Marked as absent due to no-show';
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await shift.save();

    const updatedShift = await ShiftTracking.findById(shift._id)
      .populate('user', 'fullName email role')
      .populate('department', 'name')
      .populate('ward', 'name wardNumber')
      .populate('approvedBy', 'fullName')
      .populate('modifiedBy', 'fullName');

    return NextResponse.json(updatedShift, { status: 200 });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can delete shifts
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can delete shifts' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const shift = await ShiftTracking.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
    }

    // Only allow deletion of cancelled or completed shifts
    if (!['cancelled', 'completed'].includes(shift.status)) {
      return NextResponse.json({
        message: 'Cannot delete active shift. Cancel or complete first.'
      }, { status: 400 });
    }

    await ShiftTracking.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Shift deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}