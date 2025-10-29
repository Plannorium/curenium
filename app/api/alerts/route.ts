import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Alert from '@/models/Alert';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';

const alertSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  level: z.enum(['critical', 'urgent', 'info']),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await dbConnect();
    const body = await request.json();
    const validation = alertSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });
    }

    const { message, level } = validation.data;

    const newAlert = new Alert({
      message,
      level,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    });

    await newAlert.save();

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        // Filter alerts by the user's organization
        const alerts = await Alert.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).limit(20);
        return NextResponse.json({ alerts });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}