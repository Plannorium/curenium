import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";
import Vital from "@/models/Vital";
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from "next/server";

interface AuthenticatedUser {
  id: string;
  role: string;
  organizationId: string;
  email?: string;
  fullName?: string;
}

async function authenticateUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // First try NextAuth session (for web clients)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return {
        id: session.user.id,
        role: session.user.role || 'user',
        organizationId: session.user.organizationId || '',
        email: session.user.email || undefined,
        fullName: session.user.name || undefined,
      };
    }

    // If no session, try JWT token (for mobile clients)
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

          if (decoded.userId) {
            // Verify user still exists and is active
            const User = (await import('@/models/User')).default;
            const user = await User.findById(decoded.userId).select('role organizationId email fullName verified');
            if (user && user.verified) {
              return {
                id: user._id.toString(),
                role: user.role,
                organizationId: user.organizationId?.toString() || '',
                email: user.email,
                fullName: user.fullName,
              };
            }
          }
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await authenticateUser(req);

  if (!user?.organizationId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");
  const patientId = searchParams.get("patientId");

  const query: any = { orgId: user.organizationId };

  if (targetId && targetType) {
    query.targetId = targetId;
    query.targetType = targetType;
  } else if (patientId) {
    // If only patientId is provided, fetch all related audit logs
    const patientAppointments = await Appointment.find({ patientId: patientId }).select('_id');
    const patientVitals = await Vital.find({ patientId: patientId }).select('_id');
    
    const appointmentIds = patientAppointments.map(a => a._id);
    const vitalIds = patientVitals.map(v => v._id);

    query.$or = [
      { targetId: patientId },
      { targetId: { $in: appointmentIds } },
      { targetId: { $in: vitalIds } }
    ];
  }

  try {
    const auditLogs = await AuditLog.find(query)
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json(auditLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}