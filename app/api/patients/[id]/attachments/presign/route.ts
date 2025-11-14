import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface PresignRequestBody {
  filename: string;
  category?: string;
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const params = await paramsPromise;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = [
    "doctor",
    "nurse",
    "lab_technician",
    "radiologist",
    "receptionist",
    "clinical_manager",
  ];
  if (!allowed.includes(token.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: PresignRequestBody = await req.json();
  const { filename } = body;
  await connectDB();

  const public_id = `org-${token.orgId}/patients/${params.id}/${Date.now()}-${filename}`;

  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      public_id: public_id,
      folder: `org-${token.orgId}/patients/${params.id}`,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    ok: true,
    timestamp,
    signature,
    public_id,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}