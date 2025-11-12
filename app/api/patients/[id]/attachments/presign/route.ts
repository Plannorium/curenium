// /app/api/patients/[id]/attachments/presign/route.ts 
 import { NextResponse } from "next/server" ; 
 import { getToken } from "next-auth/jwt" ; 
 import { connectDB } from "@/lib/db" ; 
 import crypto from "crypto" ; 
 
 export async function POST(req: Request, { params }: { params: { id: string  } }) { 
   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET  }); 
   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401  }); 
 
   const allowed = ["doctor", "nurse", "lab_technician", "radiologist", "receptionist", "clinical_manager" ]; 
   if (!allowed.includes(token.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403  }); 
 
   const body = await req.json (); 
   const { contentType, size, filename, category = "other"  } = body; 
   await connectDB (); 
 
   // Generate key 
   const key = `org-${token.orgId}/patients/${params.id}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${filename} `; 
 
   // Example: if using Cloudflare R2 with signed URLs (you can implement R2 presign accordingly) 
   // For now return the key and expect client to POST file to /api/upload which proxies to R2 
   return NextResponse.json ({ 
     ok: true , 
     key, 
     uploadUrl: `/api/internal/r2/upload?key=${encodeURIComponent(key)}` // implement proxying upload endpoint 
   }); 
 }