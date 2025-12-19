import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import Task from "@/models/Task";
import Patient from "@/models/Patient";

// Helper functions (same as in tasks route)
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

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all active prescriptions
    const prescriptions = await Prescription.find({
      status: { $in: ['active', 'pending'] }
    }).populate('patient', 'orgId');

    for (const prescription of prescriptions) {
      if (prescription.frequency && prescription.dose) {
        const frequencyHours = getFrequencyHours(prescription.frequency);
        if (frequencyHours > 0) {
          let nextDueTime = calculateNextMedicationDueTime(prescription, frequencyHours, now);
          if (nextDueTime <= next24Hours) {
            const taskId = `med-${prescription._id}-${nextDueTime.getTime()}`;

            // Check if task already exists
            const existingTask = await Task.findOne({ id: taskId });
            if (!existingTask) {
              const priority = getMedicationPriority(prescription, nextDueTime, now);
              const isOverdue = nextDueTime < now;
              const status = isOverdue ? 'overdue' : 'pending';
              const title = `${isOverdue ? '⚠️ OVERDUE: ' : ''}Administer ${prescription.medication || prescription.medications?.join(', ')}`;

              // Create Task document
              const newTask = new Task({
                id: taskId,
                orgId: (prescription.patient as any)?.orgId || prescription.orgId,
                patientId: prescription.patientId,
                title,
                description: `${prescription.dose} ${prescription.route || ''} - ${prescription.frequency}${isOverdue ? ' (OVERDUE)' : ''}`,
                type: 'medication',
                priority,
                dueTime: nextDueTime,
                status,
                notes: prescription.instructions || undefined,
                prescriptionId: prescription._id,
                createdBy: prescription.prescribedBy, // or system
              });
              await newTask.save();
            }
          }
        }
      }
    }

    // For standard tasks, perhaps create for all patients, but that might be too many.
    // For now, skip standard tasks in cron, as they are created when fetched.

    return NextResponse.json({ success: true, message: "Daily tasks created" });
  } catch (error) {
    console.error("Failed to create daily tasks:", error);
    return NextResponse.json({ message: "Failed to create daily tasks" }, { status: 500 });
  }
}