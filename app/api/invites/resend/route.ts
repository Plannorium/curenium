
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invite from '@/models/Invite';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { sendTeamInvitationEmail } from '@/lib/resendEmail';
import dbConnect from '@/lib/dbConnect';

interface ResendInviteRequest {
  inviteId: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { inviteId }: ResendInviteRequest = await req.json();

  try {
    const inviter = await User.findById(session.user.id);
    if (!inviter || (inviter.role !== 'admin' && inviter.role !== 'manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return NextResponse.json({ message: 'Invite not found' }, { status: 404 });
    }

    const organization = await Organization.findById(inviter.organizationId);
    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    // Optionally, refresh the token and expiration
    invite.token = crypto.randomUUID();
    invite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await invite.save();

    await sendTeamInvitationEmail(
      invite.email, 
      inviter.fullName || inviter.email, 
      organization.name,
      invite.token
    );

    return NextResponse.json({ message: 'Invite resent successfully' });
  } catch (error) {
    console.error('Error resending invite:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}