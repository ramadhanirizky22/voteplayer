import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api-response';

export async function GET() {
  const healthData: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(healthData, { status: 200 });
}
