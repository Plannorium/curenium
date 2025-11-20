// /app/api/patients/[id]/vitals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Vital from "@/models/Vital";
import Alert from "@/models/Alert";
import User from "@/models/User";
import Patient from "@/models/Patient";
import { sendWebSocketMessage } from "@/lib/websockets";
import { Vital as VitalType } from "@/types/vital";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const vitals = await Vital.find({ patientId: params.id, orgId: token.orgId }).sort({ createdAt: -1 });
    return NextResponse.json(vitals);
  } catch (error) {
    console.error("Failed to fetch vitals:", error);
    return NextResponse.json({ message: "Failed to fetch vitals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) { 
   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET  }); 
   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401  }); 
 
   // allow nurses, receptionists, doctors 
   const allowed = ["nurse", "receptionist", "doctor", "admin"]; 
   if (!token.role || !allowed.includes(token.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403  }); 

   const body: Omit<VitalType, '_id' | 'createdAt' | 'updatedAt'> = await req.json(); 
   await connectDB(); 
   const v = new Vital({ 
     ...body, 
     patientId: params.id, 
     recordedBy: token.sub, 
     orgId: token.orgId, 
   }); 
   v._setAuditContext(token.sub || 'unknown', token.role, req.headers.get("x-forwarded-for") || "unknown");
   await v.save(); 

   // WebSocket notification
   sendWebSocketMessage({
     type: "vitals_update",
     payload: {
       patientId: params.id,
       vital: v,
     },
   }, 'default', await getToken({ req, raw: true }));
 
   if (body.isUrgent) {
     const onCallDoctor = await User.findOne({ orgId: token.orgId, role: 'doctor', onCall: true });
     const patient = await Patient.findById(params.id);
   
     if (onCallDoctor && patient) {
       const alert = await Alert.create({
         orgId: token.orgId,
         patientId: params.id,
         message: `Urgent vitals recorded for ${(patient as any).fullName}.`,
         level: 'urgent',
         createdBy: token.sub,
         recipients: [onCallDoctor._id],
       });
   
       sendWebSocketMessage({
         type: "alert_notification",
         payload: alert,
       }, 'default', await getToken({ req, raw: true }));
     }
   }
   return NextResponse.json({ ok: true, vital: v }, { status: 201  }); 
 }