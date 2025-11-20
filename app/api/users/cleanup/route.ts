import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Set users offline if they haven't updated their status in the last 1.5 minutes
    const oneAndHalfMinutesAgo = new Date(Date.now() - 1.5 * 60 * 1000);

    const result = await User.updateMany(
      {
        online: true,
        updatedAt: { $lt: oneAndHalfMinutesAgo }
      },
      {
        online: false
      }
    );

    return NextResponse.json({
      message: `Cleaned up ${result.modifiedCount} offline users`,
      modifiedCount: result.modifiedCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error cleaning up online status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}