import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Ward from '@/models/Ward';
import Admission from '@/models/Admission';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const ward = await Ward.findOne({
      _id: id,
      organization: session.user.organizationId
    })
    .populate('department', 'name')
    .populate('chargeNurse', 'fullName email')
    .populate('assignedNurses', 'fullName email')
    .populate('createdBy', 'fullName');

    if (!ward) {
      return NextResponse.json({ message: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json(ward, { status: 200 });
  } catch (error) {
    console.error('Error fetching ward:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can update wards
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can update wards' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const body = await req.json() as {
      name?: string;
      wardNumber?: string;
      department?: string;
      description?: string;
      totalBeds?: number;
      wardType?: 'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric' | 'surgical' | 'medical';
      floor?: string;
      building?: string;
      chargeNurse?: string;
      assignedNurses?: string[];
      contactInfo?: {
        phone?: string;
        extension?: string;
      };
      facilities?: string[];
      isActive?: boolean;
    };

    const ward = await Ward.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!ward) {
      return NextResponse.json({ message: 'Ward not found' }, { status: 404 });
    }

    // Validation for ward number uniqueness
    if (body.wardNumber !== undefined && body.wardNumber.trim() !== ward.wardNumber) {
      const existingWard = await Ward.findOne({
        organization: session.user.organizationId,
        wardNumber: body.wardNumber.trim(),
        isActive: true,
        _id: { $ne: id }
      });

      if (existingWard) {
        return NextResponse.json({ message: 'Ward number already exists' }, { status: 409 });
      }
    }

    // Validation for total beds
    if (body.totalBeds !== undefined) {
      if (body.totalBeds < 1 || body.totalBeds > 100) {
        return NextResponse.json({ message: 'Total beds must be between 1 and 100' }, { status: 400 });
      }

      // Check if reducing beds would go below occupied beds
      if (body.totalBeds < ward.occupiedBeds) {
        return NextResponse.json({
          message: `Cannot reduce beds below current occupancy (${ward.occupiedBeds} beds occupied)`
        }, { status: 400 });
      }
    }

    // Update fields
    if (body.name !== undefined) ward.name = body.name.trim();
    if (body.wardNumber !== undefined) ward.wardNumber = body.wardNumber.trim();
    if (body.department !== undefined) ward.department = body.department as any;
    if (body.description !== undefined) ward.description = body.description?.trim() || undefined;
    if (body.totalBeds !== undefined) ward.totalBeds = body.totalBeds;
    if (body.wardType !== undefined) ward.wardType = body.wardType;
    if (body.floor !== undefined) ward.floor = body.floor?.trim() || undefined;
    if (body.building !== undefined) ward.building = body.building?.trim() || undefined;
    if (body.chargeNurse !== undefined) ward.chargeNurse = body.chargeNurse ? body.chargeNurse as any : undefined;
    if (body.assignedNurses !== undefined) ward.assignedNurses = body.assignedNurses.map(id => id as any) || [];
    if (body.contactInfo !== undefined) ward.contactInfo = body.contactInfo || {};
    if (body.facilities !== undefined) ward.facilities = body.facilities || [];
    if (body.isActive !== undefined) ward.isActive = body.isActive;

    await ward.save();

    const updatedWard = await Ward.findById(ward._id)
      .populate('department', 'name')
      .populate('chargeNurse', 'fullName email')
      .populate('assignedNurses', 'fullName email')
      .populate('createdBy', 'fullName');

    return NextResponse.json(updatedWard, { status: 200 });
  } catch (error) {
    console.error('Error updating ward:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can delete wards
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can delete wards' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const ward = await Ward.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!ward) {
      return NextResponse.json({ message: 'Ward not found' }, { status: 404 });
    }

    // Check if ward has active admissions
    const activeAdmissions = await Admission.countDocuments({
      ward: id,
      status: { $in: ['assigned', 'approved'] }
    });

    if (activeAdmissions > 0) {
      return NextResponse.json({
        message: 'Cannot delete ward with active patient admissions. Please discharge patients first.'
      }, { status: 409 });
    }

    // Soft delete by setting isActive to false
    ward.isActive = false;
    await ward.save();

    return NextResponse.json({ message: 'Ward deactivated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ward:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}