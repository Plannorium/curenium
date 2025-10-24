
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Invite from '@/models/Invite';
import Organization from '@/models/Organization';
import { sendTeamInvitationEmail } from '@/lib/resendEmail';
import crypto from 'crypto';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  await dbConnect();

  try {
    const invites = await Invite.find({ organizationId: session.user.organizationId }).populate(
      'invitedBy',
      'fullName'
    );
    return NextResponse.json({ invites }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

interface InviteBody {
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  await dbConnect();

  const { email, role } = (await req.json()) as InviteBody;

  if (!email || !role) {
    return NextResponse.json({ message: 'Email and role are required' }, { status: 400 });
  }

  try {
    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const inviteToken = crypto.randomUUID();

    const invite = await Invite.create({
      email,
      role,
      organization: organization._id,
      invitedBy: session.user.id,
      token: inviteToken,
    });


    // Send invite email
    const inviterName = session.user.name || session.user.email || 'Admin';
    const orgName = organization.name || 'Organization';
    const emailResult = await sendTeamInvitationEmail(email, inviterName, orgName, inviteToken);
    if (!emailResult.ok) {
      console.warn('Invite email not sent:', emailResult.message);
    }

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}