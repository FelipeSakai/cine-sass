import { and, eq, inArray } from "drizzle-orm";

import { db } from "src/shared/db/client";
import { catalogReservations } from "src/shared/db/schema";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";

import type {
  CatalogReservationInsert,
  CatalogReservationRecord,
  CatalogReservationsRepository,
} from "../contracts";

export class DrizzleCatalogReservationsRepository implements CatalogReservationsRepository {
  async create(
    data: Omit<CatalogReservationInsert, "id" | "createdAt" | "updatedAt">,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationRecord> {
    const [created] = await executor.insert(catalogReservations).values(data).returning();

    return created;
  }

  async findByIdAndTenantId(
    reservationId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationRecord | null> {
    const [reservation] = await executor
      .select()
      .from(catalogReservations)
      .where(
        and(
          eq(catalogReservations.id, reservationId),
          eq(catalogReservations.tenantId, tenantId),
        ),
      )
      .limit(1);

    return reservation ?? null;
  }

  async updateStatusByIdAndTenantId(
    reservationId: string,
    tenantId: string,
    status: CatalogReservationInsert["status"],
    executor: DbExecutor = db,
  ): Promise<CatalogReservationRecord | null> {
    const [reservation] = await executor
      .update(catalogReservations)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(catalogReservations.id, reservationId),
          eq(catalogReservations.tenantId, tenantId),
        ),
      )
      .returning();

    return reservation ?? null;
  }

  async findManyByIdsAndTenantId(
    reservationIds: string[],
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationRecord[]> {
    if (reservationIds.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(catalogReservations)
      .where(
        and(
          inArray(catalogReservations.id, reservationIds),
          eq(catalogReservations.tenantId, tenantId),
        ),
      );
  }
}
