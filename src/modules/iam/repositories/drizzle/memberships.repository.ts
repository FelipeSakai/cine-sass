import { db } from "src/shared/db/client";
import {
  MembershipDetails,
  MembershipInsert,
  MembershipsRepository,
  MembershipSummary,
  TenantMemberListItem,
  type DbExecutor,
} from "../iam.repositories";
import { memberships, users } from "src/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { Role } from "../../domain/role";

function toRole(value: string): Role {
  return Role[value as keyof typeof Role];
}

export class DrizzleMembershipsRepository implements MembershipsRepository {
  async findManyByTenantId(
  tenantId: string,
  executor: DbExecutor = db,
) {
  const rows = await executor
    .select({
      userId: memberships.userId,
      email: users.email,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.tenantId, tenantId));

  return rows.map((row) => ({
    userId: row.userId,
    email: row.email,
    role: row.role as Role,
  }));
}

  async findByTenantAndUser(
    tenantId: string,
    userId: string,
    executor: DbExecutor = db,
  ): Promise<MembershipDetails | null> {
    const result = await executor
      .select({
        id: memberships.id,
        tenantId: memberships.tenantId,
        userId: memberships.userId,
        role: memberships.role,
      })
      .from(memberships)
      .where(
        and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)),
      )
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      ...row,
      role: toRole(row.role),
    };
  }

  async findManyByUserId(
    userId: string,
    executor: DbExecutor = db,
  ): Promise<MembershipSummary[]> {
    const rows = await executor
      .select({
        tenantId: memberships.tenantId,
        role: memberships.role,
      })
      .from(memberships)
      .where(eq(memberships.userId, userId));

    return rows.map((row) => ({
      ...row,
      role: toRole(row.role),
    }));
  }
  async create(data: MembershipInsert, executor: DbExecutor = db) {
    const id = randomUUID();
    await executor.insert(memberships).values({ id, ...data });
    return { id };
  }
}
