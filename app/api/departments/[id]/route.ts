import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';

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
    const department = await Department.findOne({
      _id: id,
      organization: session.user.organizationId
    })
    .populate('headOfDepartment', 'fullName email')
    .populate('assignedStaff', 'fullName email role')
    .populate('createdBy', 'fullName');

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department, { status: 200 });
  } catch (error) {
    console.error('Error fetching department:', error);
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

  // Only admin can update departments
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can update departments' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const body = await req.json() as {
      name?: string;
      description?: string;
      headOfDepartment?: string;
      specialties?: string[];
      contactInfo?: {
        phone?: string;
        email?: string;
      };
      isActive?: boolean;
    };

    const department = await Department.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    // Update fields
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ message: 'Department name cannot be empty' }, { status: 400 });
      }

      // Check for duplicate name if name is being changed
      if (body.name.trim() !== department.name) {
        const existingDepartment = await Department.findOne({
          organization: session.user.organizationId,
          name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
          isActive: true,
          _id: { $ne: id }
        });

        if (existingDepartment) {
          return NextResponse.json({ message: 'Department with this name already exists' }, { status: 409 });
        }
      }

      department.name = body.name.trim();
    }

    if (body.description !== undefined) {
      department.description = body.description?.trim() || undefined;
    }

    if (body.headOfDepartment !== undefined) {
      department.headOfDepartment = body.headOfDepartment ? body.headOfDepartment as any : undefined;
    }

    if (body.specialties !== undefined) {
      department.specialties = body.specialties || [];
    }

    if (body.contactInfo !== undefined) {
      department.contactInfo = body.contactInfo || {};
    }

    if (body.isActive !== undefined) {
      department.isActive = body.isActive;
    }

    await department.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate('headOfDepartment', 'fullName email')
      .populate('assignedStaff', 'fullName email role')
      .populate('createdBy', 'fullName');

    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    console.error('Error updating department:', error);
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

  // Only admin can delete departments
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only admins can delete departments' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const department = await Department.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    // Check if department has wards
    const Ward = (await import('@/models/Ward')).default;
    const wardsCount = await Ward.countDocuments({
      department: id,
      organization: session.user.organizationId
    });

    if (wardsCount > 0) {
      return NextResponse.json({
        message: 'Cannot delete department with existing wards. Please reassign or delete wards first.'
      }, { status: 409 });
    }

    // Soft delete by setting isActive to false
    department.isActive = false;
    await department.save();

    return NextResponse.json({ message: 'Department deactivated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}