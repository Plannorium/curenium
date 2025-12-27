
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { ShiftHandoff } from '../../../../models/ShiftHandoff';
import QRCode from 'qrcode';
import mongoose from 'mongoose';

type ShiftHandoffType = {
  _id: mongoose.Types.ObjectId;
  type: 'ward' | 'department' | 'shift';
  wardId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  overview: string;
  situationsManaged: string;
  incidentsOccurred: string;
  recommendations: string;
  additionalNotes: string;
  voiceRecordings: {
    overview?: string;
    situationsManaged?: string;
    incidentsOccurred?: string;
    recommendations?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type PopulatedShiftHandoff = ShiftHandoffType & {
  createdBy: { fullName: string; image: string; role: string };
  wardId?: { name: string; wardNumber: string };
  departmentId?: { name: string };
};

interface UpdateShiftHandoffBody {
  overview?: string;
  situationsManaged?: string;
  incidentsOccurred?: string;
  recommendations?: string;
  additionalNotes?: string;
  voiceRecordings?: {
    overview?: string;
    situationsManaged?: string;
    incidentsOccurred?: string;
    recommendations?: string;
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { id } = await context.params;
  const url = new URL(req.url);
  const isQR = url.pathname.endsWith('/qr');

  await dbConnect();

  try {
    const handoff = await ShiftHandoff.findOne({
      _id: id,
      organizationId: session.user.organizationId
    })
    .populate('createdBy', 'fullName image role')
    .populate('wardId', 'name wardNumber')
    .populate('departmentId', 'name');

    if (!handoff) {
      return NextResponse.json({ message: 'Shift handoff not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== 'admin') {
      // Non-admin users can only view handoffs from their ward/department
      const userWard = (session.user as any).ward;
      const userDepartment = (session.user as any).department;
      const hasAccess = (
        (handoff.wardId && handoff.wardId.toString() === userWard) ||
        (handoff.departmentId && handoff.departmentId.toString() === userDepartment)
      );
      if (!hasAccess) {
        return NextResponse.json({ message: 'Forbidden: You can only view handoffs from your ward/department' }, { status: 403 });
      }
    }

    // Handle QR code generation
    if (isQR) {
      // Generate QR code URL
      const handoffUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shift-handoff/${id}`;

      // Generate QR code as PNG buffer
      const qrCodeBuffer = await QRCode.toBuffer(handoffUrl, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return new NextResponse(qrCodeBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="shift-handoff-${id}-qr.png"`
        }
      });
    }

    // Return regular handoff data
    return NextResponse.json(handoff, { status: 200 });
  } catch (error) {
    console.error('Error fetching shift handoff:', error);
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
    const handoff = await ShiftHandoff.findOne({
      _id: id,
      organizationId: session.user.organizationId
    });

    if (!handoff) {
      return NextResponse.json({ message: 'Shift handoff not found' }, { status: 404 });
    }

    // Check permissions - only creator or admin can update
    if (handoff.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: You can only update your own handoff reports' }, { status: 403 });
    }
const body: UpdateShiftHandoffBody = await req.json();

    const {
      overview,
      situationsManaged,
      incidentsOccurred,
      recommendations,
      additionalNotes,
      voiceRecordings
    } = body;


    // Update fields if provided. Allow voice-only updates: if overview text isn't provided
    // but a voice recording is included, ensure the textual field exists (empty string).
    if (overview !== undefined) {
      handoff.set('overview', overview.trim());
    } else if (voiceRecordings && voiceRecordings.overview) {
      // ensure the field exists to avoid possible validators that require the path
      handoff.set('overview', handoff.get('overview') || '');
    }
    if (situationsManaged !== undefined) handoff.set('situationsManaged', situationsManaged?.trim() || '');
    if (incidentsOccurred !== undefined) handoff.set('incidentsOccurred', incidentsOccurred?.trim() || '');
    if (recommendations !== undefined) handoff.set('recommendations', recommendations?.trim() || '');
    if (additionalNotes !== undefined) handoff.set('additionalNotes', additionalNotes?.trim() || '');
    if (voiceRecordings !== undefined) {
      handoff.set('voiceRecordings', voiceRecordings || {});
      // Set empty strings for any missing textual fields when voice recordings are present
      if (voiceRecordings.overview && !handoff.get('overview')) handoff.set('overview', '');
      if (voiceRecordings.situationsManaged && !handoff.get('situationsManaged')) handoff.set('situationsManaged', '');
      if (voiceRecordings.incidentsOccurred && !handoff.get('incidentsOccurred')) handoff.set('incidentsOccurred', '');
      if (voiceRecordings.recommendations && !handoff.get('recommendations')) handoff.set('recommendations', '');
    }

    await handoff.save();

    const updatedHandoff = await ShiftHandoff.findById(handoff._id)
      .populate('createdBy', 'fullName image role')
      .populate('wardId', 'name wardNumber')
      .populate('departmentId', 'name');

    return NextResponse.json(updatedHandoff, { status: 200 });
  } catch (error) {
    console.error('Error updating shift handoff:', error);
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

  // Only admin can delete shift handoffs
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can delete shift handoff reports' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const handoff = await ShiftHandoff.findOne({
      _id: id,
      organizationId: session.user.organizationId
    });

    if (!handoff) {
      return NextResponse.json({ message: 'Shift handoff not found' }, { status: 404 });
    }

    await ShiftHandoff.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Shift handoff deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shift handoff:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}