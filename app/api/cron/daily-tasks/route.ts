import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import Task from "@/models/Task";
import Patient from "@/models/Patient";
import { getFrequencyHours, calculateNextMedicationDueTime, getMedicationPriority } from "@/lib/medication-utils";

export async function GET(req: NextRequest) {
  // Verify cron secret (set via environment variable)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all active prescriptions
    const prescriptions = await Prescription.find({
      status: { $in: ['active', 'pending'] }
    }).populate('patientId', 'orgId');

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