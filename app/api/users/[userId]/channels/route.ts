
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Channel from '@/models/Channel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { userId } = await params;

    const channels = await Channel.find({
      organizationId: session.user.organizationId,
      members: userId,
    }).select('name _id');

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching user channels:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}