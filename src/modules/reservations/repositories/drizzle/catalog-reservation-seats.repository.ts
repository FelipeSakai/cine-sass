import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "src/shared/db/client";
import { catalogReservationSeats } from "src/shared/db/schema";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";

import type {
  CatalogReservationSeatInsert,
  CatalogReservationSeatRecord,
  CatalogReservationSeatsRepository,
} from "../contracts";

export class DrizzleCatalogReservationSeatsRepository
  implements CatalogReservationSeatsRepository
{
  async createMany(
    data: Array<Omit<CatalogReservationSeatInsert, "id" | "createdAt">>,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationSeatRecord[]> {
    if (data.length === 0) {
      return [];
    }

    return executor.insert(catalogReservationSeats).values(data).returning();
  }

  async findManyByReservationIdAndTenantId(
    reservationId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationSeatRecord[]> {
    return executor
      .select()
      .from(catalogReservationSeats)
      .where(
        and(
          eq(catalogReservationSeats.reservationId, reservationId),
          eq(catalogReservationSeats.tenantId, tenantId),
        ),
      )
      .orderBy(asc(catalogReservationSeats.createdAt), asc(catalogReservationSeats.sessionSeatId));
  }

  async findManyBySessionSeatIdsAndTenantId(
    sessionSeatIds: string[],
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogReservationSeatRecord[]> {
    if (sessionSeatIds.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(catalogReservationSeats)
      .where(
        and(
          inArray(catalogReservationSeats.sessionSeatId, sessionSeatIds),
          eq(catalogReservationSeats.tenantId, tenantId),
        ),
      )
      .orderBy(asc(catalogReservationSeats.createdAt), asc(catalogReservationSeats.sessionSeatId));
  }
}
