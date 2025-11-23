import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient'; // Ensure Patient model is imported first
import LabOrder from '@/models/LabOrder';

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const labOrders = await LabOrder.find({ orgId: session.user.organizationId })
      .populate('patientId', 'firstName lastName') // Populate patient first and last name
      .sort({ createdAt: -1 });

    return NextResponse.json(labOrders, { status: 200 });
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}