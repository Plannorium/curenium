import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { publicId, format, attachment }: { publicId: string, format: string, attachment?: boolean } = await request.json();

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    const isPdf = format === 'pdf' || publicId.endsWith('.pdf');

    // Generate a signed URL that is valid for 1 hour (3600 seconds)
    const url = cloudinary.url(publicId, {
      resource_type: isPdf ? 'raw' : 'image',
      sign_url: true,
      secure: true,
      attachment: attachment,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      format: format,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}