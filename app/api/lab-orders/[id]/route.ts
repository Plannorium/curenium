import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import dbConnect from '@/lib/dbConnect';
import LabOrder, { ILabOrder } from '@/models/LabOrder';

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession();
  const params = await paramsPromise;

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = params;
  const { status }: { status: ILabOrder['status'] } = await req.json();

  try {
    const labOrder = await LabOrder.findById(orderId);

    if (!labOrder) {
      return NextResponse.json({ message: 'Lab order not found' }, { status: 404 });
    }

    if (labOrder.orgId.toString() !== session.user.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    labOrder.status = status;
    await labOrder.save();

    return NextResponse.json(labOrder, { status: 200 });
  } catch (error) {
    console.error('Error updating lab order:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}