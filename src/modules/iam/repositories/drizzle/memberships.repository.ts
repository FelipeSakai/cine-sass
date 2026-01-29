import { db } from "src/shared/db/client";
import { MembershipInsert, MembershipsRepository } from "../iam.repositories";
import { memberships } from "src/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DrizzleMembershipsRepository implements MembershipsRepository {
  async findByTenantAndUser(
    tenantId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    const result = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async create(data: MembershipInsert) {
    const id = randomUUID();
    await db.insert(memberships).values({ id, ...data });
    return { id };
  }
}
