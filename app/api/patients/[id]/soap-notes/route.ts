
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import { SOAPNote } from '@/models/models';
import { ISOAPNote } from '@/models/SOAPNote';
import AuditLog from '@/models/AuditLog';
import { pusher } from '../../../../lib/pusher';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Capability check
  const allowedRoles = ['doctor', 'nurse', 'clinical_manager'];
  if (!token.role || !allowedRoles.includes(token.role as string)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { subjective, objective, assessment, plan, visibility, encounterId } = (await req.json()) as ISOAPNote;

    const soapNote = new SOAPNote({
      patientId: id,
      author: token.id,
      authorRole: token.role,
      orgId: token.orgId,
      subjective,
      objective,
      assessment,
      plan,
      visibility,
      encounterId,
    });

    await soapNote.save();

    // Audit log
    await AuditLog.create({
      orgId: token.orgId,
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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const soapNotes = await SOAPNote.find({ patientId: id, orgId: token.orgId }).populate('author', 'firstName lastName');
    return NextResponse.json(soapNotes);
  } catch (error) {
    console.error('Error fetching SOAP notes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}