import { and, asc, eq } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { db } from "src/shared/db/client";
import { catalogSessionSeats } from "src/shared/db/schema";

import type {
  CatalogSessionSeatInsert,
  CatalogSessionSeatRecord,
  CatalogSessionSeatsRepository,
} from "../contracts";

export class DrizzleCatalogSessionSeatsRepository implements CatalogSessionSeatsRepository {
  async createMany(
    data: Array<
      Omit<CatalogSessionSeatInsert, "id" | "createdAt" | "updatedAt" | "status"> & {
        status?: CatalogSessionSeatInsert["status"];
      }
    >,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionSeatRecord[]> {
    if (data.length === 0) {
      return [];
    }

    return executor.insert(catalogSessionSeats).values(data).returning();
  }

  async findManyBySessionIdAndTenantId(
    sessionId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionSeatRecord[]> {
    return executor
      .select()
      .from(catalogSessionSeats)
      .where(
        and(
          eq(catalogSessionSeats.sessionId, sessionId),
          eq(catalogSessionSeats.tenantId, tenantId),
        ),
      )
      .orderBy(
        asc(catalogSessionSeats.rowLabel),
        asc(catalogSessionSeats.seatNumber),
        asc(catalogSessionSeats.createdAt),
      );
  }

  async findByIdAndSessionIdAndTenantId(
    seatId: string,
    sessionId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogSessionSeatRecord | null> {
    const [seat] = await executor
      .select()
      .from(catalogSessionSeats)
      .where(
        and(
          eq(catalogSessionSeats.id, seatId),
          eq(catalogSessionSeats.sessionId, sessionId),
          eq(catalogSessionSeats.tenantId, tenantId),
        ),
      );

    return seat ?? null;
  }

  async updateStatusByIdAndSessionIdAndTenantId(
    seatId: string,
    sessionId: string,
    tenantId: string,
    status: CatalogSessionSeatInsert["status"],
    executor: DbExecutor = db,
  ): Promise<CatalogSessionSeatRecord | null> {
    const [seat] = await executor
      .update(catalogSessionSeats)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(catalogSessionSeats.id, seatId),
          eq(catalogSessionSeats.sessionId, sessionId),
          eq(catalogSessionSeats.tenantId, tenantId),
        ),
      )
      .returning();

    return seat ?? null;
  }
}
