import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Admission from '@/models/Admission';
import Ward from '@/models/Ward';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const doctorId = searchParams.get('doctor');
  const matronNurseId = searchParams.get('matronNurse');

  await dbConnect();

  try {
    const query: any = {
      organization: session.user.organizationId
    };

    // Role-based filtering
    if (session.user.role === 'doctor') {
      query.doctor = session.user.id;
    } else if (session.user.role === 'matron_nurse') {
      // Matron Nurses can see all admissions for review/assignment
      // They can filter by status if needed
    } else if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (status) {
      if (status === 'pending') {
        query.status = { $in: ['requested', 'pending_review'] };
      } else {
        query.status = status;
      }
    }

    if (doctorId) query.doctor = doctorId;
    if (matronNurseId) query.matronNurse = matronNurseId;

    let admissions;

    try {
      admissions = await Admission.find(query)
        .populate('patient', 'firstName lastName mrn dob gender')
        .populate('doctor', 'fullName email')
        .populate({ path: 'matronNurse', select: 'fullName email', options: { strictPopulate: false } })
        .populate('department', 'name')
        .populate('ward', 'name wardNumber totalBeds occupiedBeds')
        .sort({ requestedAt: -1 })
        .limit(100); // Limit results to prevent memory issues

    } catch (dbError) {
      console.error('Database query error:', dbError);

      // If it's a connection error, try a simpler query
      if (dbError.message?.includes('EPIPE') || dbError.name === 'MongoNetworkError') {
        console.log('Connection error detected, trying simplified query...');
        try {
          admissions = await Admission.find(query)
            .sort({ requestedAt: -1 })
            .limit(50);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return NextResponse.json({ message: 'Database connection error' }, { status: 503 });
        }
      } else {
        return NextResponse.json({ message: 'Database query error' }, { status: 500 });
      }
    }

    return NextResponse.json(admissions, { status: 200 });

    return NextResponse.json(admissions, { status: 200 });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only doctors and nurses can request admissions
  if (!['doctor', 'matron_nurse', 'admin'].includes(session.user.role || '')) {
    return NextResponse.json({ message: 'Forbidden: Only doctors and nurses can request admissions' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json() as {
      patientId: string;
      reason: string;
      urgency: 'routine' | 'urgent' | 'emergency';
      estimatedStay?: number;
      specialRequirements?: string[];
      doctorNotes?: string;
      departmentId: string;
      wardId: string;
    };

    const { patientId, reason, urgency, estimatedStay, specialRequirements, doctorNotes, departmentId, wardId } = body;

    if (!patientId || !reason?.trim() || !urgency || !departmentId || !wardId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if patient already has an active admission
    const existingAdmission = await Admission.findOne({
      patient: patientId,
      status: { $in: ['requested', 'pending_review', 'approved', 'assigned'] }
    });

    if (existingAdmission) {
      return NextResponse.json({
        message: 'Patient already has an active admission request'
      }, { status: 409 });
    }

    const newAdmission = new Admission({
      patient: patientId,
      doctor: session.user.id,
      organization: session.user.organizationId,
      reason: reason.trim(),
      urgency,
      estimatedStay,
      specialRequirements: specialRequirements || [],
      doctorNotes: doctorNotes?.trim(),
      department: departmentId,
      ward: wardId,
      status: 'requested',
      createdBy: session.user.id
    });

    await newAdmission.save();

    const populatedAdmission = await Admission.findById(newAdmission._id)
      .populate('patient', 'firstName lastName mrn dob gender')
      .populate('doctor', 'fullName email');

    return NextResponse.json(populatedAdmission, { status: 201 });
  } catch (error) {
    console.error('Error creating admission request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}