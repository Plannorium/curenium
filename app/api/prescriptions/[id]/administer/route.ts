import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Prescription from "@/models/Prescription";
import Task from "@/models/Task";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";
import { getFrequencyHours, calculateNextMedicationDueTime, getMedicationPriority } from "@/lib/medication-utils";

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
        // Validate prescription status before creating next task
        const now = new Date();
        if (prescription.status !== 'active') {
          console.log(`Skipping next task creation: prescription ${prescription._id} is not active (status: ${prescription.status})`);
        } else if (prescription.endDate && new Date(prescription.endDate) <= now) {
          console.log(`Skipping next task creation: prescription ${prescription._id} has ended (endDate: ${prescription.endDate})`);
        } else {
          const frequencyHours = getFrequencyHours(prescription.frequency);
          if (frequencyHours > 0) {
            const nextDueTime = calculateNextMedicationDueTime(prescription, frequencyHours, now);
            // Improve task ID generation to avoid collisions by including a random component
            const taskId = `med-${prescription._id}-${nextDueTime.getTime()}-${Math.random().toString(36).substr(2, 9)}`;

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