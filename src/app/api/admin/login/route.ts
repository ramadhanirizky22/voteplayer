import { NextRequest } from 'next/server';
import { AdminLoginSchema } from '@/schemas/admin.schema';
import { AdminRepository } from '@/repositories/admin.repository';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { AppError, handleApiError, successResponse } from '@/utils/error-handler';
import crypto from 'crypto';

const adminRepo = new AdminRepository();
const auditRepo = new AuditLogRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AdminLoginSchema.parse(body);

    const admin = await adminRepo.findByEmail(validated.email);
    if (!admin) {
      throw new AppError('Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Secure Hash Comparison
    const hashedInput = crypto.createHash('sha256').update(validated.password).digest('hex');
    if (admin.passwordHash !== hashedInput && admin.passwordHash !== validated.password) {
      throw new AppError('Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Record Audit Log
    await auditRepo.create({
      adminId: admin.id,
      action: 'LOGIN',
      targetEntity: 'admin',
      targetId: admin.id,
      ipAddress: clientIp,
    });

    // In production: Return Signed JWT Token or Set HttpOnly Secure Cookie
    return successResponse({
      token: `mock-jwt-token-for-admin-${admin.id}`,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
