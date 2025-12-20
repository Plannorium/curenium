import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  await dbConnect();

  try {
    const departments = await Department.find({
      organization: session.user.organizationId,
      isActive: true
    })
    .populate('headOfDepartment', 'fullName email')
    .populate('assignedStaff', 'fullName email role')
    .sort({ name: 1 });

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only admin can create departments
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can create departments' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json() as {
      name: string;
      description?: string;
      headOfDepartment?: string;
      specialties?: string[];
      contactInfo?: {
        phone?: string;
        email?: string;
      };
    };

    const { name, description, headOfDepartment, specialties, contactInfo } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Department name is required' }, { status: 400 });
    }

    // Check if department with same name exists in organization
    const existingDepartment = await Department.findOne({
      organization: session.user.organizationId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true
    });

    if (existingDepartment) {
      return NextResponse.json({ message: 'Department with this name already exists' }, { status: 409 });
    }

    const newDepartment = new Department({
      name: name.trim(),
      description: description?.trim(),
      headOfDepartment: headOfDepartment || undefined,
      organization: session.user.organizationId,
      specialties: specialties || [],
      contactInfo: contactInfo || {},
      createdBy: session.user.id
    });

    await newDepartment.save();

    const populatedDepartment = await Department.findById(newDepartment._id)
      .populate('headOfDepartment', 'fullName email');

    return NextResponse.json(populatedDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}