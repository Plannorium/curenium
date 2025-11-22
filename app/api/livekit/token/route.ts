import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AccessToken } from 'livekit-server-sdk';

// Server route: POST /api/livekit/token
// Body: { room?: string, ttl?: string }
// Requires NEXTAUTH session cookie and LIVEKIT_API_KEY/SECRET in env.

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { room?: string; roomId?: string; ttl?: string };
    const room = body.room || body.roomId || 'default';
    const ttl = body.ttl || '2h';

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identity = (token as any).sub || (token as any).id || (token as any).email || 'user';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error('Missing LiveKit env vars');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: String(identity), ttl });
    // Grant room join and publishing permissions for the requested room
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await at.toJwt();

    return NextResponse.json({ token: jwt, url: livekitUrl });
  } catch (err) {
    console.error('Error generating LiveKit token:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
