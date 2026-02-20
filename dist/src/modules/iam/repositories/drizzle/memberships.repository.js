import { db } from "src/shared/db/client";
import { memberships } from "src/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
export class DrizzleMembershipsRepository {
    async findByTenantAndUser(tenantId, userId, executor = db) {
        const result = await executor
            .select({
            id: memberships.id,
            tenantId: memberships.tenantId,
            userId: memberships.userId,
            role: memberships.role,
        })
            .from(memberships)
            .where(and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)))
            .limit(1);
        return result[0] ?? null;
    }
    async findManyByUserId(userId, executor = db) {
        const rows = await executor
            .select({
            tenantId: memberships.tenantId,
            role: memberships.role,
        })
            .from(memberships)
            .where(eq(memberships.userId, userId));
        return rows;
    }
    async create(data, executor = db) {
        const id = randomUUID();
        await executor.insert(memberships).values({ id, ...data });
        return { id };
    }
}
