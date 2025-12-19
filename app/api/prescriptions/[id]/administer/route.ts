import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import Task from "@/models/Task";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

// Helper functions
function getFrequencyHours(frequency: string): number {
  const freq = frequency.toLowerCase();
  if (freq.includes('q4h')) return 4;
  if (freq.includes('q6h')) return 6;
  if (freq.includes('q8h')) return 8;
  if (freq.includes('q12h')) return 12;
  if (freq.includes('daily')) return 24;
  if (freq.includes('bid')) return 12;
  if (freq.includes('tid')) return 8;
  if (freq.includes('qid')) return 6;
  return 8;
}

function calculateNextMedicationDueTime(prescription: any, frequencyHours: number, currentTime: Date): Date {
  const administrations = prescription.administrations || [];
  if (administrations.length === 0) {
    if (prescription.startDate) {
      const startDate = new Date(prescription.startDate);
      if (startDate > currentTime) return startDate;
      const hoursSinceStart = (currentTime.getTime() - startDate.getTime()) / 3600000;
      const dosesSinceStart = Math.floor(hoursSinceStart / frequencyHours);
      const nextDoseTime = new Date(startDate.getTime() + (dosesSinceStart + 1) * frequencyHours * 3600000);
      return nextDoseTime > currentTime ? nextDoseTime : new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return currentTime;
  }
  const sortedAdmins = administrations
    .filter((admin: any) => admin.administeredAt)
    .sort((a: any, b: any) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime());
  if (sortedAdmins.length === 0) return currentTime;
  const lastAdminTime = new Date(sortedAdmins[0].administeredAt);
  const nextDueTime = new Date(lastAdminTime.getTime() + frequencyHours * 3600000);
  if (nextDueTime <= currentTime) {
    const hoursSinceLastAdmin = (currentTime.getTime() - lastAdminTime.getTime()) / 3600000;
    const missedDoses = Math.floor(hoursSinceLastAdmin / frequencyHours);
    const correctedNextDueTime = new Date(lastAdminTime.getTime() + (missedDoses + 1) * frequencyHours * 3600000);
    if (correctedNextDueTime <= currentTime) {
      return new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return correctedNextDueTime;
  }
  return nextDueTime;
}

function getMedicationPriority(prescription: any, dueTime: Date, now: Date): 'low' | 'medium' | 'high' | 'urgent' {
  const hoursUntilDue = (dueTime.getTime() - now.getTime()) / 3600000;
  if (hoursUntilDue < 0.5) return 'urgent';
  if (hoursUntilDue < 2) return 'high';
  return 'medium';
}

interface AdministerRequestBody {
  administeredAt: Date;
  doseAdministered: string;
  notes: string;
  status: 'administered' | 'missed' | 'patient_refused' | 'not_available';
  reasonNotGiven?: string;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid prescription ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const body: AdministerRequestBody = await req.json();
    const { administeredAt, doseAdministered, notes, status, reasonNotGiven } = body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const administrationRecord = {
      administeredBy: new mongoose.Types.ObjectId(token.id as string),
      administeredAt,
      doseAdministered,
      notes,
      status,
      reasonNotGiven,
    };

    if (!prescription.administrations) {
      prescription.administrations = [];
    }
    prescription.administrations.push(administrationRecord);
    await prescription.save({ validateBeforeSave: false });

    // Create next medication task if administered successfully
    if (status === 'administered') {
      try {
        const frequencyHours = getFrequencyHours(prescription.frequency);
        if (frequencyHours > 0) {
          const now = new Date();
          const nextDueTime = calculateNextMedicationDueTime(prescription, frequencyHours, now);
          const taskId = `med-${prescription._id}-${nextDueTime.getTime()}`;

          // Check if task already exists
          const existingTask = await Task.findOne({ id: taskId });
          if (!existingTask) {
            const priority = getMedicationPriority(prescription, nextDueTime, now);
            const title = `Administer ${prescription.medication || prescription.medications?.join(', ')}`;

            const newTask = new Task({
              id: taskId,
              orgId: prescription.orgId,
              patientId: prescription.patientId,
              title,
              description: `${prescription.dose} ${prescription.route || ''} - ${prescription.frequency}`,
              type: 'medication',
              priority,
              dueTime: nextDueTime,
              status: 'pending',
              notes: prescription.instructions || undefined,
              prescriptionId: prescription._id,
              createdBy: prescription.prescribedBy,
            });
            await newTask.save();
          }
        }
      } catch (taskError) {
        console.error("Failed to create next medication task:", taskError);
        // Don't fail the administration if task creation fails
      }
    }

    await AuditLog.create({
      orgId: token.organizationId,
      userId: token.id,
      action: "administer_medication",
      details: `Medication administered for prescription ${id}, status: ${status}`,
    });

    return NextResponse.json(prescription, { status: 200 });
  } catch (error) {
    console.error("Failed to administer medication:", error);
    return NextResponse.json({ error: "Failed to administer medication" }, { status: 500 });
  }
}