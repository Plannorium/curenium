import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ConversionProgress {
  status: 'queued' | 'converting' | 'uploading' | 'completed' | 'failed';
  progress: number;
  pdfUrl?: string;
  error?: string;
}

const CONVERSION_SERVICE_URL = process.env.CONVERSION_SERVICE_URL;

async function convertToPdf(fileUrl: string): Promise<string> {
  if (!CONVERSION_SERVICE_URL) {
    throw new Error('Conversion service URL not configured');
  }

  const response = await fetch(`${CONVERSION_SERVICE_URL}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl }),
  });

  if (!response.ok) {
    throw new Error(`Conversion failed: ${await response.text()}`);
  }

  const result: { pdfUrl: string } = await response.json();
  return result.pdfUrl;
}

async function uploadToCloudinary(pdfUrl: string, originalFilename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(pdfUrl, {
      resource_type: 'raw',
      public_id: `curenium/chat/converted/${originalFilename.replace(/\.[^/.]+$/, '')}.pdf`,
      format: 'pdf',
    }, (error, result) => {
      if (error) reject(error);
      else if (result && result.secure_url) resolve(result.secure_url);
      else reject(new Error('Upload failed: no secure_url returned'));
    });
  });
}

const progressMap = new Map<string, ConversionProgress>();

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;
    const conversionId = crypto.randomUUID();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only accept Word documents
    if (!file.type.includes('word')) {
      return NextResponse.json({ error: 'Only Word documents can be converted' }, { status: 400 });
    }

    // Set initial progress
    progressMap.set(conversionId, { status: 'queued', progress: 0 });

    // Upload the original file to get a URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let originalUrl: string;
    try {
      progressMap.set(conversionId, { status: 'uploading', progress: 30 });
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'curenium/chat/temp' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      originalUrl = uploadResult.secure_url;
    } catch (error) {
      progressMap.set(conversionId, { 
        status: 'failed', 
        progress: 0, 
        error: 'Failed to upload original file' 
      });
      throw error;
    }

    // Start conversion
    progressMap.set(conversionId, { status: 'converting', progress: 60 });
    let pdfUrl: string;
    try {
      pdfUrl = await convertToPdf(originalUrl);
    } catch (error) {
      progressMap.set(conversionId, { 
        status: 'failed', 
        progress: 0, 
        error: 'Conversion failed' 
      });
      throw error;
    }

    // Upload converted PDF
    progressMap.set(conversionId, { status: 'uploading', progress: 80 });
    try {
      const finalUrl = await uploadToCloudinary(pdfUrl, file.name);
      progressMap.set(conversionId, { 
        status: 'completed', 
        progress: 100, 
        pdfUrl: finalUrl 
      });

      return NextResponse.json({
        conversionId,
        status: 'completed',
        pdfUrl: finalUrl
      });
    } catch (error) {
      progressMap.set(conversionId, { 
        status: 'failed', 
        progress: 0, 
        error: 'Failed to upload converted PDF' 
      });
      throw error;
    }

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversionId = searchParams.get('id');

  if (!conversionId) {
    return NextResponse.json({ error: 'No conversion ID provided' }, { status: 400 });
  }

  const progress = progressMap.get(conversionId);
  if (!progress) {
    return NextResponse.json({ error: 'Conversion not found' }, { status: 404 });
  }

  return NextResponse.json(progress);
}