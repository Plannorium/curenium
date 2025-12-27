import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import HandoffNote from '@/models/HandoffNote';
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
    const handoff = await HandoffNote.findOne({
      _id: id,
      organizationId: session.user.organizationId
    })
    .populate('patientId', 'firstName lastName mrn')
    .populate('shiftId', 'user shiftDate scheduledStart scheduledEnd')
    .populate('createdBy', 'fullName role')
    .populate('wardId', 'name wardNumber')
    .populate('departmentId', 'name');

    if (!handoff) {
      return NextResponse.json({ message: 'Handoff note not found' }, { status: 404 });
    }

    // Check permissions - similar to shift handoff, but for patient handoffs, perhaps allow if same patient or something, but for now, allow within org
    // Since it's patient handoff, perhaps check if user has access to the patient
    // But to keep simple, allow within org for now

    // Handle QR code generation
    if (isQR) {
      // Generate QR code URL
      const handoffUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notes/handoff/${id}`;

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
          'Content-Disposition': `attachment; filename="handoff-note-${id}-qr.png"`
        }
      });
    }

    // Return regular handoff data
    return NextResponse.json(handoff, { status: 200 });
  } catch (error) {
    console.error('Error fetching handoff note:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}