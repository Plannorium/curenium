import { NextResponse } from "next/server" ; 
 import { v2 as cloudinary } from "cloudinary" ; 
 import { getToken } from "next-auth/jwt" ; 
 import { writeAudit } from "@/lib/audit" ; 
 import { connectDB } from "@/lib/db" ; 
 
 cloudinary.config ({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME !, 
   api_key: process.env.CLOUDINARY_API_KEY !, 
   api_secret: process.env.CLOUDINARY_API_SECRET ! 
 }); 
 
 export async function POST(req: Request ) { 
   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET  }); 
   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401  }); 
 
   const body = await req.json (); 
   const { filename, folder = `org-${token.orgId} /patients` } = body; 
 
   // timestamp + params for signed upload 
   const timestamp = Math.floor(Date.now() / 1000 ); 
   const paramsToSign: any  = { 
     folder, 
     timestamp 
   }; 
 
   // generate signature server-side using cloudinary 
   const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET !); 
 
   // form data output for client to use 
   const  payload = { 
     cloudName: process.env.CLOUDINARY_CLOUD_NAME , 
     apiKey: process.env.CLOUDINARY_API_KEY , 
     folder, 
     timestamp, 
     signature, 
     uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME} /auto/upload` 
   }; 
 
   // audit the presign request 
   await connectDB (); 
   await writeAudit ({ 
     orgId: token.orgId , 
     userId: token.sub , 
     userRole: token.role , 
     action: "attachment.presign" , 
     targetType: "Attachment" , 
     meta : { filename, folder }, 
     ip: req.headers.get("x-forwarded-for") || null 
   }); 
 
   return NextResponse.json (payload); 
 }