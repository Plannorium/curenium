import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import dbConnect from '@/lib/dbConnect';
import LabOrder, { ILabOrder } from '@/models/LabOrder';
import LabResult from '@/models/LabResult';

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const params = await paramsPromise;
  const { id: orderId } = params;
  const body: any = await req.json();

  try {
    await dbConnect();

    const updatedLabOrder = await LabOrder.findByIdAndUpdate(
      orderId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedLabOrder) {
      return NextResponse.json({ error: "Lab order not found" }, { status: 404 });
    }

    if (updatedLabOrder.status === 'Completed' && body.results) {
      const newLabResult = new LabResult({
        patientId: updatedLabOrder.patientId,
        labOrderId: updatedLabOrder._id,
        results: body.results,
        collectedAt: new Date(),
      });
      await newLabResult.save();
    }

    return NextResponse.json(updatedLabOrder.toObject());
  } catch (error: any) {
    console.error("Error updating lab order:", error);
    return NextResponse.json(
      { error: "Error updating lab order", details: error.message },
      { status: 500 }
    );
  }
}