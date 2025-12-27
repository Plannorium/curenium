import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { HandoffReport } from '@/models/HandoffReport';
import Patient from '@/models/Patient';
import ShiftTracking from '@/models/ShiftTracking';
import { jsPDF } from 'jspdf';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const shiftId = searchParams.get('shiftId');

  await dbConnect();

  try {
    const query: any = {
      // Model uses `organizationId` as the organization reference
      organizationId: session.user.organizationId,
    };

    if (patientId) {
      query.patientId = patientId;
    }

    if (shiftId) {
      query.shiftId = shiftId;
    }

    const reports = await HandoffReport.find(query)
      .populate('patientId', 'firstName lastName mrn')
      .populate('shiftId', 'user shiftDate scheduledStart scheduledEnd')
      .populate('createdBy', 'fullName role')
      .sort({ createdAt: -1 });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Error fetching handoff reports:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      patientId?: string;
      shiftId?: string;
      sbar: {
        situation: string;
        background: string;
        assessment: string;
        recommendation: string;
      };
      exportPDF?: boolean;
    };

    const { patientId, shiftId, sbar, exportPDF } = body;

    await dbConnect();

    // Validate patient if provided
    if (patientId) {
      const patient = await Patient.findOne({
        _id: patientId,
        orgId: session.user.organizationId
      });
      if (!patient) {
        return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
      }
    }

    // Validate shift if provided
    if (shiftId) {
      const shift = await ShiftTracking.findOne({
        _id: shiftId,
        organization: session.user.organizationId
      });
      if (!shift) {
        return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
      }
    }

    const newReport = new HandoffReport({
      patientId,
      shiftId,
      sbar,
      // Model expects `createdBy` and `organizationId`
      createdBy: session.user.id,
      organizationId: session.user.organizationId,
    });

    await newReport.save();

    if (exportPDF) {
      // Generate PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('SBAR Handoff Report', 20, 30);

      // Date and time
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);

      // Patient info if available
      if (patientId) {
        const patient = await Patient.findById(patientId);
        if (patient) {
          doc.text(`Patient: ${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn})`, 20, 55);
        }
      }

      // Shift info if available
      if (shiftId) {
        const shift = await ShiftTracking.findById(shiftId).populate('user', 'fullName');
        if (shift) {
          doc.text(`Shift: ${(shift.user as any).fullName} - ${new Date(shift.shiftDate).toLocaleDateString()}`, 20, 65);
        }
      }

      let yPosition = 85;

      // SBAR sections
      const sections = [
        { title: 'S - Situation', content: sbar.situation },
        { title: 'B - Background', content: sbar.background },
        { title: 'A - Assessment', content: sbar.assessment },
        { title: 'R - Recommendation', content: sbar.recommendation }
      ];

      sections.forEach(section => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(section.content, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 10;

        // Add page break if needed
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
      });

      // Footer
      doc.setFontSize(10);
      doc.text(`Created by: ${session.user.name || session.user.email}`, 20, yPosition + 10);

      const pdfBuffer = doc.output('arraybuffer');

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="handoff-report.pdf"'
        }
      });
    }

    const populatedReport = await HandoffReport.findById(newReport._id)
      .populate('patientId', 'firstName lastName mrn')
      .populate('shiftId', 'user shiftDate scheduledStart scheduledEnd')
      .populate('createdBy', 'fullName role');

    return NextResponse.json(populatedReport, { status: 201 });
  } catch (error) {
    console.error('Error creating handoff report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}