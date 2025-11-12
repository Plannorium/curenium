// /app/api/patients/[id]/vitals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import Vital from "@/models/Vital";
import { Vital as VitalType } from "@/types/vital"; 
 
 export async function POST(req: NextRequest, { params }: { params: { id: string } }) { 
   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET  }); 
   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401  }); 
 
   // allow nurses, receptionists, doctors 
   const allowed = ["nurse", "receptionist", "doctor" ]; 
   if (!allowed.includes(token.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403  }); 
 
   const body: VitalType = await req.json(); 
   await connectDB (); 
   const v = await Vital.create({ 
     ...body, 
     orgId: token.orgId, 
     patientId: params.id, 
     recordedBy: token.sub || token.id, 
   }); 
   return NextResponse.json({ ok: true, vital: v }, { status: 201  }); 
 }