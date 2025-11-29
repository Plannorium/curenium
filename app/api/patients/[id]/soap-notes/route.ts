
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { SOAPNote } from '@/models/models';
import { ISOAPNote } from '@/models/SOAPNote';
import AuditLog from '@/models/AuditLog';
import { pusher } from '../../../../lib/pusher';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const token = await getToken({ req });

  if (!token || !token.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Capability check
  const allowedRoles = ['doctor', 'nurse', 'admin', 'matron_nurse'];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { subjective, objective, assessment, plan, visibility, encounterId } = (await req.json()) as ISOAPNote;

    const soapNoteData: any = {
        patientId: id,
        author: token.id as any,
        authorRole: token.role,
        orgId: token.organizationId,
        subjective,
        objective,
        assessment,
        plan,
        visibility,
    };

    if (encounterId && mongoose.Types.ObjectId.isValid(encounterId as any)) {
        soapNoteData.encounterId = encounterId;
    }

    const soapNote = new SOAPNote(soapNoteData);

    await soapNote.save();

    // Audit log
    await AuditLog.create({
      orgId: token.organizationId,
      userId: token.id,
      action: 'soap.create',
      targetId: soapNote._id,
      targetType: 'SOAPNote',
    });

    // Emit event
    await pusher.trigger(`patient-${id}`, 'soap_created', {
      note: soapNote,
    });

    return NextResponse.json({ ok: true, note: soapNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating SOAP note:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const token = await getToken({ req });

  if (!token || !token.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Capability check
  const allowedRoles = ['doctor', 'nurse', 'admin', 'matron_nurse'];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const soapNotes = await SOAPNote.find({ patientId: id, orgId: token.organizationId }).populate('author', 'firstName lastName');
    return NextResponse.json(soapNotes);
  } catch (error) {
    console.error('Error fetching SOAP notes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}