import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDB from "@/lib/dbConnect";
import Ward from "@/models/Ward";
import User from "@/models/User";
import { writeAudit } from "@/lib/audit";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to assign nurses (matron or admin)
    if (session.user.role !== 'matron_nurse' && session.user.role !== 'admin') {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
    }

    const { id: wardId } = await params;
    const body = await req.json();
    const { nurseIds } = body as { nurseIds: string[] };

    if (!Array.isArray(nurseIds) || !nurseIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ message: "nurseIds must be an array of strings" }, { status: 400 });
    }

    await connectToDB();

    // Find the ward
    const ward = await Ward.findOne({
      _id: wardId,
      organization: session.user.organizationId
    });

    if (!ward) {
      return NextResponse.json({ message: "Ward not found" }, { status: 404 });
    }

    // Validate that all nurses exist and belong to the same organization
    const nurses = await User.find({
      _id: { $in: nurseIds },
      organizationId: session.user.organizationId,
      role: { $in: ['nurse', 'matron_nurse'] }
    });

    if (nurses.length !== nurseIds.length) {
      return NextResponse.json({ message: "Some nurses not found or invalid" }, { status: 400 });
    }

    // Get currently assigned nurse IDs
    const currentNurseIds = ward.assignedNurses?.map(n => String(n._id)) || [];

    // Capture before state for audit
    const beforeAssignedNurses = [...(ward.assignedNurses || [])];

    // Update ward with assigned nurses
    ward.assignedNurses = nurseIds.map(nurseId => {
      const nurse = nurses.find(n => n._id.toString() === nurseId);
      return {
        _id: nurseId,
        fullName: nurse?.fullName || 'Unknown'
      };
    }) as any;

    // Perform operations in a transaction for atomicity
    await mongoose.connection.transaction(async (session) => {
      await ward.save({ session });

      // Update nurse assignments: assign ward and department to selected nurses
      await User.updateMany(
        { _id: { $in: nurseIds } },
        { ward: wardId, department: ward.department },
        { session }
      );

      // Remove ward assignment from nurses who are no longer assigned
      const removedNurseIds = currentNurseIds.filter(id => !nurseIds.includes(id));
      if (removedNurseIds.length > 0) {
        await User.updateMany(
          { _id: { $in: removedNurseIds } },
          { $unset: { ward: 1 } },
          { session }
        );
      }
    });

    // Create audit log
    await writeAudit({
      orgId: session.user.organizationId || '',
      userId: session.user.id || '',
      userRole: session.user.role || 'user',
      action: 'ward.nurses.assign',
      targetType: 'Ward',
      targetId: wardId,
      before: { assignedNurses: beforeAssignedNurses },
      after: { assignedNurses: nurses.map(n => ({ _id: n._id, fullName: n.fullName })) },
      meta: { nurseIds, wardName: ward.name },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      message: "Nurses assigned successfully",
      ward: {
        _id: ward._id,
        name: ward.name,
        assignedNurses: ward.assignedNurses
      }
    });
  } catch (error) {
    console.error("Failed to assign nurses to ward:", error);
    return NextResponse.json(
      { message: "Failed to assign nurses to ward" },
      { status: 500 }
    );
  }
}