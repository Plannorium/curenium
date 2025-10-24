
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message') || 'Unauthorized';
  return NextResponse.json({ message }, { status: 403 });
}