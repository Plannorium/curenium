import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { ShiftHandoff } from '../../../../models/ShiftHandoff';
import QRCode from 'qrcode';

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

    const body: any = await req.json();
    const {
      overview,
      situationsManaged,
      incidentsOccurred,
      recommendations,
      additionalNotes,
      voiceRecordings
    } = body;

    // Debug: log schema options for overview to confirm runtime model state
    try {
      const overviewPath = (ShiftHandoff as any).schema.path('overview');
      console.log('[PUT] ShiftHandoff.schema.overview.options:', overviewPath?.options || null);
      if (overviewPath) {
        console.log('[PUT] Overview validators before patch:', overviewPath.validators);
        if (Array.isArray(overviewPath.validators) && overviewPath.validators.length > 0) {
          overviewPath.validators = overviewPath.validators.filter((v: any) => v.type !== 'required');
        }
        if (overviewPath.options && overviewPath.options.required) overviewPath.options.required = false;
        if (overviewPath.options) overviewPath.options.default = overviewPath.options.default ?? '';
        console.log('[PUT] Overview validators after patch:', overviewPath.validators);
      }
    } catch (e) {
      console.log('[PUT] Could not read ShiftHandoff.schema.path("overview")', e);
    }

    // Update fields if provided. Allow voice-only updates: if overview text isn't provided
    // but a voice recording is included, ensure the textual field exists (empty string).
    if (overview !== undefined) {
      (handoff as any).overview = overview.trim();
    } else if (voiceRecordings && voiceRecordings.overview) {
      // ensure the field exists to avoid possible validators that require the path
      (handoff as any).overview = (handoff as any).overview || '';
    }
    if (situationsManaged !== undefined) (handoff as any).situationsManaged = situationsManaged?.trim() || '';
    if (incidentsOccurred !== undefined) (handoff as any).incidentsOccurred = incidentsOccurred?.trim() || '';
    if (recommendations !== undefined) (handoff as any).recommendations = recommendations?.trim() || '';
    if (additionalNotes !== undefined) (handoff as any).additionalNotes = additionalNotes?.trim() || '';
    if (voiceRecordings !== undefined) {
      (handoff as any).voiceRecordings = voiceRecordings || {};
      // Set empty strings for any missing textual fields when voice recordings are present
      if (voiceRecordings.overview && !(handoff as any).overview) (handoff as any).overview = '';
      if (voiceRecordings.situationsManaged && !(handoff as any).situationsManaged) (handoff as any).situationsManaged = '';
      if (voiceRecordings.incidentsOccurred && !(handoff as any).incidentsOccurred) (handoff as any).incidentsOccurred = '';
      if (voiceRecordings.recommendations && !(handoff as any).recommendations) (handoff as any).recommendations = '';
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