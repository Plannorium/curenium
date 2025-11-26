import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Admission from '@/models/Admission';
import Ward from '@/models/Ward';
import Discharge from '@/models/Discharge';

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
    const admission = await Admission.findOne({
      _id: id,
      organization: session.user.organizationId
    })
    .populate('patient', 'firstName lastName mrn dob gender contact')
    .populate('doctor', 'fullName email')
    .populate({ path: 'matronNurse', select: 'fullName email', options: { strictPopulate: false } })
    .populate('department', 'name')
    .populate('ward', 'name wardNumber totalBeds occupiedBeds wardType');

    if (!admission) {
      return NextResponse.json({ message: 'Admission not found' }, { status: 404 });
    }

    // Check permissions
    if ((session.user.role === 'doctor' || session.user.role === 'matron_nurse') && admission.doctor.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(admission, { status: 200 });
  } catch (error) {
    console.error('Error fetching admission:', error);
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

  const { id } = await context.params;

  await dbConnect();

  try {
    const body = await req.json() as {
      action: 'approve' | 'assign' | 'cancel' | 'complete';
      matronNurseNotes?: string;
      department?: string;
      ward?: string;
      bedNumber?: string;
      wardNotes?: string;
    };

    const admission = await Admission.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!admission) {
      return NextResponse.json({ message: 'Admission not found' }, { status: 404 });
    }

    const { action, matronNurseNotes, department, ward, bedNumber, wardNotes } = body;

    switch (action) {
      case 'approve':
        // Matron Nurse approves admission directly
        if (session.user.role !== 'matron_nurse' && session.user.role !== 'admin') {
          return NextResponse.json({ message: 'Forbidden: Only Matron Nurses can approve admissions' }, { status: 403 });
        }
        if (!department) {
          return NextResponse.json({ message: 'Department is required for approval' }, { status: 400 });
        }
        admission.status = 'approved';
        admission.matronNurse = session.user.id as any;
        admission.department = department as any;
        admission.matronNurseNotes = matronNurseNotes?.trim();
        admission.reviewedAt = new Date();
        break;

      case 'assign':
        // Matron Nurse assigns ward and bed
        if (session.user.role !== 'matron_nurse' && session.user.role !== 'admin' || admission.matronNurse?.toString() !== session.user.id) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        if (!ward || !bedNumber) {
          return NextResponse.json({ message: 'Ward and bed number are required for assignment' }, { status: 400 });
        }

        // Check ward availability
        const selectedWard = await Ward.findById(ward);
        if (!selectedWard || selectedWard.occupiedBeds >= selectedWard.totalBeds) {
          return NextResponse.json({ message: 'Ward is at full capacity' }, { status: 400 });
        }

        admission.status = 'assigned';
        admission.ward = ward as any;
        admission.bedNumber = bedNumber;
        admission.wardNotes = wardNotes?.trim();
        admission.assignedAt = new Date();

        // Update ward occupancy
        selectedWard.occupiedBeds += 1;
        await selectedWard.save();
        break;

      case 'cancel':
        // Can be cancelled by doctor or Matron Nurse
        if (session.user.role === 'doctor' && admission.doctor.toString() !== session.user.id) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        if (session.user.role === 'matron_nurse' && admission.matronNurse?.toString() !== session.user.id) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        admission.status = 'cancelled';
        if (matronNurseNotes) admission.matronNurseNotes = matronNurseNotes.trim();
        break;

      case 'complete':
        // Only when discharge is created
        if (session.user.role !== 'matron_nurse') {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Check if discharge exists
        const discharge = await Discharge.findOne({ admission: id });
        if (!discharge) {
          return NextResponse.json({ message: 'Cannot complete admission without discharge record' }, { status: 400 });
        }

        admission.status = 'completed';
        admission.completedAt = new Date();

        // Free up bed
        if (admission.ward) {
          const currentWard = await Ward.findById(admission.ward);
          if (currentWard && currentWard.occupiedBeds > 0) {
            currentWard.occupiedBeds -= 1;
            await currentWard.save();
          }
        }
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await admission.save();

    const updatedAdmission = await Admission.findById(admission._id)
      .populate('patient', 'firstName lastName mrn dob gender contact')
      .populate('doctor', 'fullName email')
      .populate({ path: 'matronNurse', select: 'fullName email', options: { strictPopulate: false } })
      .populate('department', 'name')
      .populate('ward', 'name wardNumber totalBeds occupiedBeds wardType');

    return NextResponse.json(updatedAdmission, { status: 200 });
  } catch (error) {
    console.error('Error updating admission:', error);
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

  const { id } = await context.params;

  await dbConnect();

  try {
    const admission = await Admission.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!admission) {
      return NextResponse.json({ message: 'Admission not found' }, { status: 404 });
    }

    // Only allow deletion of cancelled or completed admissions
    if (!['cancelled', 'completed'].includes(admission.status)) {
      return NextResponse.json({
        message: 'Cannot delete active admission. Cancel first or complete the process.'
      }, { status: 400 });
    }

    // Only admin or the doctor who created it can delete
    if (session.user.role !== 'admin' && admission.doctor.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Admission.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Admission deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting admission:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}