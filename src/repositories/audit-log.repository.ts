import { db } from '@/lib/db';
import { AuditAction, AuditLog } from '@prisma/client';

export interface CreateAuditLogInput {
  adminId: string;
  action: AuditAction;
  targetEntity: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditLogRepositoryInterface {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
}

export class AuditLogRepository implements AuditLogRepositoryInterface {
  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    return db.auditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetEntity: data.targetEntity,
        targetId: data.targetId ?? null,
        metadata: data.metadata ? (data.metadata as object) : undefined,
        ipAddress: data.ipAddress ?? null,
      },
    });
  }
}
