import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
      return NextResponse.json({ error: 'Missing PDF URL' }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL.
    // e.g. https://res.cloudinary.com/demo/raw/upload/v1556033381/sample.pdf
    // The public ID is 'sample' (if no folder) or 'folder/sample'
    // The part after /v<version>/ is the public_id with format.
    const versionPart = pdfUrl.match(/\/v\d+\//);
    if (!versionPart || typeof versionPart.index === 'undefined') {
      return NextResponse.json({ error: 'Invalid Cloudinary URL format' }, { status: 400 });
    }

    const publicIdWithFormat = pdfUrl.substring(versionPart.index + versionPart[0].length);
    
    // The resource type for pdf is often 'raw', but for transformation we need to treat it as an 'image'.
    // Cloudinary's .url() method handles this when we provide the public id.
    const publicId = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.'));

    if (!publicId) {
      return NextResponse.json({ error: 'Could not extract public ID from URL' }, { status: 400 });
    }

    // Generate thumbnail URL using Cloudinary transformations
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'image', // we are requesting an image
      width: 300, // Target width of 300px
      page: 1, // Get the first page
      format: 'jpg', // Convert to JPG
      crop: 'limit',
      quality: 'auto',
      secure: true,
    });

    return NextResponse.json({ thumbnailUrl });
  } catch (error) {
    console.error('Failed to generate thumbnail URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail URL' },
      { status: 500 }
    );
  }
}