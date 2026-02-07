import { db } from "src/shared/db/client";
import {
  MembershipInsert,
  MembershipsRepository,
  type DbExecutor,
} from "../iam.repositories";
import { memberships } from "src/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DrizzleMembershipsRepository implements MembershipsRepository {
  async findByTenantAndUser(
    tenantId: string,
    userId: string,
    executor: DbExecutor = db,
  ) {
    const result = await executor
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findManyByUserId(userId: string, executor: DbExecutor = db) {
    const rows = await executor
      .select({
        tenantId: memberships.tenantId,
        role: memberships.role,
      })
      .from(memberships)
      .where(eq(memberships.userId, userId));

    return rows;
  }
  async create(data: MembershipInsert, executor: DbExecutor = db) {
    const id = randomUUID();
    await executor.insert(memberships).values({ id, ...data });
    return { id };
  }
}
