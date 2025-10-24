import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Invite from '@/models/Invite';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { sendTeamInvitationEmail } from '@/lib/resendEmail';
import crypto from 'crypto';

interface InviteRequest {
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { email, role }: InviteRequest = await req.json();

    if (!email || !role) {
      return NextResponse.json({ message: 'Email and role are required' }, { status: 400 });
    }

    const inviter = await User.findById(session.user.id);
    if (!inviter) {
      return NextResponse.json({ message: 'Inviter not found' }, { status: 404 });
    }

    const organization = await Organization.findById(inviter.organizationId);
    if (!organization) {
        return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const invite = new Invite({
      email,
      role,
      organizationId: inviter.organizationId,
      invitedBy: inviter._id,
      token,
    });

    await invite.save();

    await sendTeamInvitationEmail(email, inviter.fullName, organization.name, token);

    return NextResponse.json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}