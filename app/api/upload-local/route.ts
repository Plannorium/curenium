import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    try {
      await stat(uploadsDir);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await mkdir(uploadsDir, { recursive: true });
      } else {
        throw error;
      }
    }

    const filePath = join(uploadsDir, file.name);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${file.name}`,
      name: file.name,
      type: file.type,
      size: file.size,
      resource_type: file.type.startsWith('image') ? 'image' : 'raw',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload error:', errorMessage);
    return NextResponse.json({ success: false, error: `Upload failed: ${errorMessage}` });
  }
}