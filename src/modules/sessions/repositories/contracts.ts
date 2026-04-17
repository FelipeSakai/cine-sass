import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { catalogSessions } from "src/shared/db/schema";

export type CatalogSessionInsert = InferInsertModel<typeof catalogSessions>;
export type CatalogSessionRecord = InferSelectModel<typeof catalogSessions>;

export interface CatalogSessionsRepository {
  create(
    data: Omit<CatalogSessionInsert, "id" | "createdAt" | "updatedAt">,
    executor?: DbExecutor,
  ): Promise<CatalogSessionRecord>;
  findByIdAndTenantId(
    sessionId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionRecord | null>;
  findManyByTenantId(
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionRecord[]>;
  findOverlappingScheduledSession(params: {
    tenantId: string;
    roomId: string;
    startsAt: Date;
    endsAt: Date;
    executor?: DbExecutor;
  }): Promise<CatalogSessionRecord | null>;
}
