import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Validate environment variables at configuration time
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: NextRequest) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.organizationId) {

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  }

  try {

    const formData = await request.formData();

    const file = formData.get('file') as File | null;

    if (!file) {

      return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    }

    // File validation: type and size

    if (!file.type.startsWith('audio/')) {

      return NextResponse.json({ error: 'Invalid file type. Only audio files are allowed.' }, { status: 400 });

    }

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {

      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });

    }

    // Convert file to buffer

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary

    const result: UploadApiResponse = await new Promise((resolve, reject) => {

      const uploadStream = cloudinary.uploader.upload_stream(

        {

          resource_type: 'video', // Audio files are treated as video in Cloudinary

          folder: `curenium/voice-recordings/${session.user.organizationId}`,

          format: 'mp3', // Convert to MP3 for better compression

          quality: 'auto',

          audio_codec: 'mp3',

          audio_frequency: 44100,

        },

        (error, result) => {

          if (error) reject(error);

          else resolve(result as UploadApiResponse);

        }

      );

      uploadStream.end(buffer);

    });

    return NextResponse.json({

      success: true,

      url: result.secure_url,

      publicId: result.public_id,

      duration: result.duration,

      format: result.format,

      size: result.bytes,

    });

  } catch (error) {

    console.error('Voice upload error:', error);

    return NextResponse.json(

      { error: 'Failed to upload voice recording' },

      { status: 500 }

    );

  }

}

export async function DELETE(request: NextRequest) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.organizationId) {

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  }

  try {

    const { publicId } = await request.json() as { publicId: string };

    if (!publicId) {

      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 });

    }

    // Delete from Cloudinary

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

    if (result.result !== 'ok') {

      return NextResponse.json({ error: 'Failed to delete from Cloudinary' }, { status: 500 });

    }

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error('Voice delete error:', error);

    return NextResponse.json(

      { error: 'Failed to delete voice recording' },

      { status: 500 }

    );

  }

}
