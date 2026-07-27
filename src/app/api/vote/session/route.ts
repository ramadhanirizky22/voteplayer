import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { handleApiError, successResponse } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const secretPepper = process.env.SECURITY_HASH_PEPPER || 'voteplay-secure-pepper';
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Generate HMAC signature for anti-bot validation
    const signature = crypto
      .createHmac('sha256', secretPepper)
      .update(`${clientIp}:${userAgent}:${timestamp}:${nonce}`)
      .digest('hex');

    const sessionToken = `${timestamp}.${nonce}.${signature}`;

    return successResponse({
      sessionToken,
      expiresIn: 300, // 5 minutes TTL
    });
  } catch (error) {
    return handleApiError(error);
  }
}
