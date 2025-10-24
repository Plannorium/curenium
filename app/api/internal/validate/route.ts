import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'invalid' }, { status: 401 });
    }

    const user = {
      id: token.sub || token?.id || token?.userId,
      name: token.name || token?.username || token?.email,
      email: token.email,
      picture: token.picture || null,
    };

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('validate error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}