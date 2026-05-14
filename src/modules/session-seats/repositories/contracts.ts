import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { catalogSessionSeats } from "src/shared/db/schema";

export type CatalogSessionSeatInsert = InferInsertModel<typeof catalogSessionSeats>;
export type CatalogSessionSeatRecord = InferSelectModel<typeof catalogSessionSeats>;
export type CatalogSessionSeatStatus = NonNullable<CatalogSessionSeatInsert["status"]>;

export interface CatalogSessionSeatsRepository {
  createMany(
    data: Array<
      Omit<CatalogSessionSeatInsert, "id" | "createdAt" | "updatedAt" | "status"> & {
        status?: CatalogSessionSeatInsert["status"];
      }
    >,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord[]>;
  findManyBySessionIdAndTenantId(
    sessionId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord[]>;
  findManyByIdsAndSessionIdAndTenantId(
    seatIds: string[],
    sessionId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord[]>;
  findByIdAndSessionIdAndTenantId(
    seatId: string,
    sessionId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord | null>;
  holdManyAvailableByIdsAndSessionIdAndTenantId(
    seatIds: string[],
    sessionId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord[]>;
  updateManyByIdsAndSessionIdAndTenantId(
    seatIds: string[],
    sessionId: string,
    tenantId: string,
    currentStatus: CatalogSessionSeatStatus,
    nextStatus: CatalogSessionSeatStatus,
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord[]>;
  updateStatusByIdAndSessionIdAndTenantId(
    seatId: string,
    sessionId: string,
    tenantId: string,
    status: CatalogSessionSeatInsert["status"],
    executor?: DbExecutor,
  ): Promise<CatalogSessionSeatRecord | null>;
}
