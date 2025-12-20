import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Ward from '@/models/Ward';
import Department from '@/models/Department';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('department');

  await dbConnect();

  try {
    const query: any = {
      organization: session.user.organizationId,
      isActive: true
    };

    if (departmentId) {
      query.department = departmentId;
    }

    const wards = await Ward.find(query)
      .populate('department', 'name')
      .populate('chargeNurse', 'fullName email')
      .populate('assignedNurses', 'fullName email')
      .sort({ wardNumber: 1 });

    return NextResponse.json(wards, { status: 200 });
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can create wards
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can create wards' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json() as {
      name: string;
      wardNumber: string;
      department: string;
      description?: string;
      totalBeds: number;
      totalRooms?: number;
      wardType: 'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric' | 'surgical' | 'medical';
      floor?: string;
      building?: string;
      chargeNurse?: string;
      assignedNurses?: string[];
      contactInfo?: {
        phone?: string;
        extension?: string;
      };
      facilities?: string[];
    };

    const {
      name,
      wardNumber,
      department,
      description,
      totalBeds,
      totalRooms,
      wardType,
      floor,
      building,
      chargeNurse,
      assignedNurses,
      contactInfo,
      facilities
    } = body;

    // Validation
    if (!name?.trim() || !wardNumber?.trim() || !department || !totalBeds || !wardType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (totalBeds < 1 || totalBeds > 100) {
      return NextResponse.json({ message: 'Total beds must be between 1 and 100' }, { status: 400 });
    }

    if (totalRooms !== undefined && (totalRooms < 1 || totalRooms > 50)) {
      return NextResponse.json({ message: 'Total rooms must be between 1 and 50' }, { status: 400 });
    }

    // Check if department exists and belongs to organization
    const dept = await Department.findOne({
      _id: department,
      organization: session.user.organizationId,
      isActive: true
    });

    if (!dept) {
      return NextResponse.json({ message: 'Invalid department' }, { status: 400 });
    }

    // Check if ward number already exists in organization
    const existingWard = await Ward.findOne({
      organization: session.user.organizationId,
      wardNumber: wardNumber.trim(),
      isActive: true
    });

    if (existingWard) {
      return NextResponse.json({ message: 'Ward number already exists' }, { status: 409 });
    }

    const newWard = new Ward({
      name: name.trim(),
      wardNumber: wardNumber.trim(),
      department,
      organization: session.user.organizationId,
      description: description?.trim(),
      totalBeds,
      totalRooms: totalRooms || undefined,
      wardType,
      floor: floor?.trim(),
      building: building?.trim(),
      chargeNurse: chargeNurse || undefined,
      assignedNurses: assignedNurses || [],
      contactInfo: contactInfo || {},
      facilities: facilities || [],
      createdBy: session.user.id
    });

    await newWard.save();

    const populatedWard = await Ward.findById(newWard._id)
      .populate('department', 'name')
      .populate('chargeNurse', 'fullName email')
      .populate('assignedNurses', 'fullName email');

    return NextResponse.json(populatedWard, { status: 201 });
  } catch (error) {
    console.error('Error creating ward:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}