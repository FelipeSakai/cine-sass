import { and, asc, eq, gt, lt } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { db } from "src/shared/db/client";
import { catalogSessions } from "src/shared/db/schema";

import type {
  CatalogSessionInsert,
  CatalogSessionRecord,
  CatalogSessionsRepository,
} from "../contracts";

export class DrizzleCatalogSessionsRepository implements CatalogSessionsRepository {
  async create(
    data: Omit<CatalogSessionInsert, "id" | "createdAt" | "updatedAt">,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionRecord> {
    const [created] = await executor.insert(catalogSessions).values(data).returning();

    return created;
  }

  async findByIdAndTenantId(
    sessionId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionRecord | null> {
    const [session] = await executor
      .select()
      .from(catalogSessions)
      .where(
        and(eq(catalogSessions.id, sessionId), eq(catalogSessions.tenantId, tenantId)),
      )
      .limit(1);

    return session ?? null;
  }

  async findManyByTenantId(
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionRecord[]> {
    return executor
      .select()
      .from(catalogSessions)
      .where(eq(catalogSessions.tenantId, tenantId))
      .orderBy(asc(catalogSessions.startsAt), asc(catalogSessions.createdAt));
  }

  async findOverlappingScheduledSession({
    tenantId,
    roomId,
    startsAt,
    endsAt,
    executor = db,
  }: {
    tenantId: string;
    roomId: string;
    startsAt: Date;
    endsAt: Date;
    executor?: DbExecutor;
  }): Promise<CatalogSessionRecord | null> {
    const [session] = await executor
      .select()
      .from(catalogSessions)
      .where(
        and(
          eq(catalogSessions.tenantId, tenantId),
          eq(catalogSessions.roomId, roomId),
          eq(catalogSessions.status, "SCHEDULED"),
          lt(catalogSessions.startsAt, endsAt),
          gt(catalogSessions.endsAt, startsAt),
        ),
      )
      .limit(1);

    return session ?? null;
  }
}
