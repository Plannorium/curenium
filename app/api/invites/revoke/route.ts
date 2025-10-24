
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invite from '@/models/Invite';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

interface RevokeInviteRequest {
  inviteId: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { inviteId }: RevokeInviteRequest = await req.json();

  try {
    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const result = await Invite.deleteOne({ _id: inviteId, organizationId: user.organizationId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Invite not found or you do not have permission to revoke it' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invite revoked successfully' });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}