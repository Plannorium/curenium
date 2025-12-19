import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';
import User from '@/models/User';
import { writeAudit } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only matron or admin can assign staff
  if (session.user.role !== 'matron_nurse' && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Only Matron Nurses or Admins can assign staff' }, { status: 403 });
  }

  const { id } = await context.params;

  await dbConnect();

  try {
    const body = await req.json() as { staffIds: string[] };
    const { staffIds } = body;

    // Validate department exists and belongs to organization
    const department = await Department.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    // Validate all staff members exist and belong to organization
    const staffMembers = await User.find({
      _id: { $in: staffIds },
      organizationId: session.user.organizationId
    });

    if (staffMembers.length !== staffIds.length) {
      return NextResponse.json({ message: 'One or more staff members not found' }, { status: 404 });
    }

    // Get currently assigned staff IDs
    const currentStaffIds = department.assignedStaff?.map(s => (s._id as any)?._id || s._id) || [];

    // Update department with assigned staff
    department.assignedStaff = staffMembers.map(staff => ({
      _id: staff._id as any,
      fullName: staff.fullName,
      role: staff.role
    }));

    await department.save();

    // Update staff assignments: assign department to selected staff
    await User.updateMany(
      { _id: { $in: staffIds } },
      { department: id }
    );

    // Remove department assignment from staff who are no longer assigned
    const removedStaffIds = currentStaffIds.filter(id => !staffIds.includes(id));
    if (removedStaffIds.length > 0) {
      await User.updateMany(
        { _id: { $in: removedStaffIds } },
        { $unset: { department: 1 } }
      );
    }

    const updatedDepartment = await Department.findById(department._id)
      .populate('headOfDepartment', 'fullName email')
      .populate('assignedStaff', 'fullName email role');

    // Create audit log
    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'department.assign_staff',
      targetType: 'Department',
      targetId: id,
      after: {
        assignedStaff: staffMembers.map(s => ({
          _id: s._id,
          fullName: s.fullName,
          role: s.role
        }))
      },
      meta: {
        departmentName: department.name,
        staffCount: staffMembers.length,
        staffNames: staffMembers.map(s => s.fullName)
      },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      message: 'Staff assigned successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Error assigning staff to department:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}