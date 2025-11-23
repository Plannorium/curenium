import { pusher } from './../../../../lib/pusher';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import Attachment, { IAttachment } from "@/models/Attachment";
import Patient, { IPatient } from "@/models/Patient";
import { headers } from "next/headers";
import * as z from "zod";
import AuditLog from "@/models/AuditLog";

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession();
  const params = await paramsPromise;

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); 
  }

  const { id: patientId } = params;

  try {
    const patient: IPatient | null = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    if (patient.orgId.toString() !== session.user.organizationId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const attachments = await Attachment.find({ patientId });

    return NextResponse.json(attachments, { status: 200 });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const attachmentSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  format: z.string(),
  bytes: z.number(),
  category: z.string(),
  notes: z.string().optional(),
  original_filename: z.string(),
});

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession();
  const params = await paramsPromise;
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "::1";

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: patientId } = params;
  const body = await req.json();

  const validation = attachmentSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
  }

  const { public_id, secure_url, format, bytes, category, notes, original_filename } = validation.data;

  try {
    const patient: IPatient | null = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // Ensure the user has access to the patient's organization
    if (patient.orgId.toString() !== session.user.organizationId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const attachmentCategory = category || "other";
    const newAttachment: IAttachment = new Attachment({
      orgId: session.user.organizationId,
      patientId,
      uploadedBy: session.user.id,
      public_id,
      secure_url,
      format,
      bytes,
      category: attachmentCategory,
      notes: notes || null,
      original_filename,
    });

    await newAttachment.save();

    // Create an audit log entry
    await AuditLog.create({
      orgId: session.user.organizationId,
      userId: session.user.id,
      action: 'attachment.create',
      targetId: newAttachment._id,
      targetType: 'Attachment',
      details: `Uploaded an attachment (${attachmentCategory}) for patient ${patientId}`,
    });

    // Trigger a real-time notification
    await Promise.all([
      pusher.trigger(
        `patient-${patientId}`,
        'attachment:new',
        newAttachment
      ),
      pusher.trigger(
        `organization-${session.user.organizationId}`,
        'attachment:new',
        newAttachment
      )
    ]);

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error) {
    console.error("Error creating attachment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}