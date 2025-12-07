import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'refresh' || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('role organizationId email fullName verified');
    if (!user || !user.verified) {
      return NextResponse.json({ message: 'User not found or inactive' }, { status: 401 });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
        type: 'refresh',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error('Refresh token error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}