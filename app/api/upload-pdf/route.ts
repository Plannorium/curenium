
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload PDF and generate a preview JPG (first page) eagerly
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: "auto", // Cloudinary detects PDF
        pages: true, // Request page count in the upload response
        folder: "qt-enum/docs",
        // eager transformation to create first page JPG thumb (pg_1)
        eager: [
          {
            format: "jpg",
            transformation: [{ page: 1 }, { width: 800, crop: "fit" }],
          },
        ],
        eager_async: false,
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      uploadStream.end(buffer);
    });

    // result.derived[0].secure_url will be the JPG preview (if created)
    // Eager transformations may appear in `eager` or `derived` array. Check both.
    const previewUrl =
      (result.eager && result.eager[0]?.secure_url) ||
      (result.derived && result.derived[0]?.secure_url) || null;
    const url = result.secure_url;
    const pageCount = result.pages || 1;

    return NextResponse.json({
      url,
      previewUrl,
      pageCount,
      publicId: result.public_id,
      name: file.name,
      format: result.format,
      type: file.type,
      size: file.size,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}