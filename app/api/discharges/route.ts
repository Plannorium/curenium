import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Discharge from '@/models/Discharge';
import Admission from '@/models/Admission';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const matronNurseId = searchParams.get('matronNurse');

  await dbConnect();

  try {
    const query: any = {
      organization: session.user.organizationId
    };

    // Role-based filtering
    if (session.user.role === 'matron_nurse') {
      query.matronNurse = session.user.id;
    } else if (session.user.role !== 'admin' && session.user.role !== 'doctor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (status) query.status = status;
    if (matronNurseId) query.matronNurse = matronNurseId;

    const discharges = await Discharge.find(query)
      .populate('patient', 'firstName lastName mrn dob gender')
      .populate('admission')
      .populate('doctor', 'fullName email')
      .populate('matronNurse', 'fullName email')
      .sort({ plannedDate: -1 });

    return NextResponse.json(discharges, { status: 200 });
  } catch (error) {
    console.error('Error fetching discharges:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only Matron Nurses can create discharge plans
  if (session.user.role !== 'matron_nurse') {
    return NextResponse.json({ message: 'Forbidden: Only Matron Nurses can create discharge plans' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json() as {
      admissionId: string;
      plannedDate: string;
      dischargeType: 'routine' | 'against_medical_advice' | 'transfer' | 'death';
      dischargeReason: string;
      dischargeDiagnosis?: string;
      clinicalSummary?: string;
      medicationsOnDischarge?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration?: string;
      }>;
      followUpInstructions?: string;
      followUpAppointments?: Array<{
        date: string;
        type: string;
        notes?: string;
      }>;
      patientInstructions?: string;
      caregiverInstructions?: string;
    };

    const {
      admissionId,
      plannedDate,
      dischargeType,
      dischargeReason,
      dischargeDiagnosis,
      clinicalSummary,
      medicationsOnDischarge,
      followUpInstructions,
      followUpAppointments,
      patientInstructions,
      caregiverInstructions
    } = body;

    if (!admissionId || !plannedDate || !dischargeType || !dischargeReason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if admission exists and is active
    const admission = await Admission.findOne({
      _id: admissionId,
      organization: session.user.organizationId,
      status: 'assigned'
    })
    .populate('patient')
    .populate('doctor');

    if (!admission) {
      return NextResponse.json({ message: 'Invalid or inactive admission' }, { status: 400 });
    }

    // Check if discharge already exists for this admission
    const existingDischarge = await Discharge.findOne({ admission: admissionId });
    if (existingDischarge) {
      return NextResponse.json({ message: 'Discharge plan already exists for this admission' }, { status: 409 });
    }

    const newDischarge = new Discharge({
      patient: admission.patient,
      admission: admissionId,
      doctor: admission.doctor,
      matronNurse: session.user.id,
      organization: session.user.organizationId,
      plannedDate: new Date(plannedDate),
      dischargeType,
      dischargeReason: dischargeReason.trim(),
      dischargeDiagnosis: dischargeDiagnosis?.trim(),
      clinicalSummary: clinicalSummary?.trim(),
      medicationsOnDischarge: medicationsOnDischarge || [],
      followUpInstructions: followUpInstructions?.trim(),
      followUpAppointments: followUpAppointments?.map(app => ({
        date: new Date(app.date),
        type: app.type,
        notes: app.notes?.trim()
      })) || [],
      patientInstructions: patientInstructions?.trim(),
      caregiverInstructions: caregiverInstructions?.trim(),
      status: 'planned'
    });

    await newDischarge.save();

    const populatedDischarge = await Discharge.findById(newDischarge._id)
      .populate('patient', 'firstName lastName mrn dob gender')
      .populate('admission')
      .populate('doctor', 'fullName email')
      .populate('matronNurse', 'fullName email');

    return NextResponse.json(populatedDischarge, { status: 201 });
  } catch (error) {
    console.error('Error creating discharge plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}