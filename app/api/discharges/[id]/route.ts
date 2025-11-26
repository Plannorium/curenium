import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Discharge from '@/models/Discharge';
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
    const discharge = await Discharge.findOne({
      _id: id,
      organization: session.user.organizationId
    })
    .populate('patient', 'firstName lastName mrn dob gender contact')
    .populate('admission')
    .populate('doctor', 'fullName email')
    .populate('matronNurse', 'fullName email');

    if (!discharge) {
      return NextResponse.json({ message: 'Discharge not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'matron_nurse' && discharge.matronNurse.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(discharge, { status: 200 });
  } catch (error) {
    console.error('Error fetching discharge:', error);
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
      action: 'update' | 'complete' | 'cancel';
      plannedDate?: string;
      dischargeType?: 'routine' | 'against_medical_advice' | 'transfer' | 'death';
      dischargeReason?: string;
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
      dischargeNotes?: string;
      patientInstructions?: string;
      caregiverInstructions?: string;
      dischargePapers?: string[];
      finalBill?: number;
      insuranceStatus?: string;
    };

    const discharge = await Discharge.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!discharge) {
      return NextResponse.json({ message: 'Discharge not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'matron_nurse' && discharge.matronNurse.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { action, ...updateData } = body;

    switch (action) {
      case 'update':
        // Update discharge plan details
        if (updateData.plannedDate) discharge.plannedDate = new Date(updateData.plannedDate);
        if (updateData.dischargeType) discharge.dischargeType = updateData.dischargeType;
        if (updateData.dischargeReason) discharge.dischargeReason = updateData.dischargeReason.trim();
        if (updateData.dischargeDiagnosis !== undefined) discharge.dischargeDiagnosis = updateData.dischargeDiagnosis?.trim();
        if (updateData.clinicalSummary !== undefined) discharge.clinicalSummary = updateData.clinicalSummary?.trim();
        if (updateData.medicationsOnDischarge) discharge.medicationsOnDischarge = updateData.medicationsOnDischarge;
        if (updateData.followUpInstructions !== undefined) discharge.followUpInstructions = updateData.followUpInstructions?.trim();
        if (updateData.followUpAppointments) {
          discharge.followUpAppointments = updateData.followUpAppointments.map(app => ({
            date: new Date(app.date),
            type: app.type,
            notes: app.notes?.trim()
          }));
        }
        if (updateData.dischargeNotes !== undefined) discharge.dischargeNotes = updateData.dischargeNotes?.trim();
        if (updateData.patientInstructions !== undefined) discharge.patientInstructions = updateData.patientInstructions?.trim();
        if (updateData.caregiverInstructions !== undefined) discharge.caregiverInstructions = updateData.caregiverInstructions?.trim();
        break;

      case 'complete':
        // Complete the discharge
        if (session.user.role !== 'matron_nurse') {
          return NextResponse.json({ message: 'Forbidden: Only Matron Nurses can complete discharges' }, { status: 403 });
        }

        discharge.status = 'completed';
        discharge.actualDischargeDate = new Date();
        discharge.completedAt = new Date();

        if (updateData.dischargePapers) discharge.dischargePapers = updateData.dischargePapers;
        if (updateData.finalBill !== undefined) discharge.finalBill = updateData.finalBill;
        if (updateData.insuranceStatus) discharge.insuranceStatus = updateData.insuranceStatus;

        // Update admission status to completed
        const admission = await Admission.findById(discharge.admission);
        if (admission) {
          admission.status = 'completed';
          admission.completedAt = new Date();
          await admission.save();
        }
        break;

      case 'cancel':
        // Cancel the discharge plan
        discharge.status = 'cancelled';
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await discharge.save();

    const updatedDischarge = await Discharge.findById(discharge._id)
      .populate('patient', 'firstName lastName mrn dob gender contact')
      .populate('admission')
      .populate('doctor', 'fullName email')
      .populate('matronNurse', 'fullName email');

    return NextResponse.json(updatedDischarge, { status: 200 });
  } catch (error) {
    console.error('Error updating discharge:', error);
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
    const discharge = await Discharge.findOne({
      _id: id,
      organization: session.user.organizationId
    });

    if (!discharge) {
      return NextResponse.json({ message: 'Discharge not found' }, { status: 404 });
    }

    // Only allow deletion of cancelled discharges
    if (discharge.status !== 'cancelled') {
      return NextResponse.json({
        message: 'Cannot delete active discharge plan. Cancel first.'
      }, { status: 400 });
    }

    // Only admin or the Matron Nurse who created it can delete
    if (session.user.role !== 'admin' && discharge.matronNurse.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Discharge.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Discharge plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting discharge:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}