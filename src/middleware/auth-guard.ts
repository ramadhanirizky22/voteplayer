import { NextRequest, NextResponse } from 'next/server';

export function authGuardMiddleware(request: NextRequest): NextResponse | null {
  const token = request.headers.get('authorization') || request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    if (!token && !request.nextUrl.pathname.endsWith('/login')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication token required' } },
        { status: 401 }
      );
    }
  }

  return null;
}
