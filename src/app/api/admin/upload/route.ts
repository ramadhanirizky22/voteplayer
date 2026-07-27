import { NextRequest } from 'next/server';
import { storage } from '@/lib/storage';
import { AppError, handleApiError, successResponse } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'avatars' | 'logos' | 'covers' | 'banners') || 'avatars';

    if (!file) {
      throw new AppError('No file uploaded in form payload', 400, 'FILE_MISSING');
    }

    if (!['avatars', 'logos', 'covers', 'banners'].includes(folder)) {
      throw new AppError('Invalid upload destination folder', 400, 'INVALID_FOLDER');
    }

    // Convert file blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to NevaCloud Object Storage via S3 driver
    const fileUrl = await storage.uploadFile(buffer, file.name, {
      folder,
      contentType: file.type || 'image/png',
    });

    return successResponse({
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
