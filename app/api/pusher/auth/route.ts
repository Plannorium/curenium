import { NextRequest } from 'next/server';
import { pusher } from '../../../lib/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

interface PusherAuthBody {
  socket_id: string;
  channel_name: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const socket_id = formData.get('socket_id') as string;
  const channel_name = formData.get('channel_name') as string;

  const userId = session.user.id;

  if (channel_name === `private-user-${userId}`) {
    const auth = pusher.authenticate(socket_id, channel_name);
    return Response.json(auth);
  }

  return new Response('Forbidden', { status: 403 });
}