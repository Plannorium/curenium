import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: Buffer, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(file);
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const getResourceType = (fileType: string) => {
      if (fileType === 'application/pdf') {
        return 'raw';
      }
      if (fileType.startsWith('image/')) {
        return 'image';
      }
      if (fileType.startsWith('video/')) {
        return 'video';
      }
      return 'auto';
    };

    const resource_type = getResourceType(file.type);

    const result = await uploadToCloudinary(buffer, {
        resource_type,
        folder: 'curenium/chat',
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id, // Add this line
      name: file.name,
      type: file.type,
      size: result.bytes,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' });
  }
}