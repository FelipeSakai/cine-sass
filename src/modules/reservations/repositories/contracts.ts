import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { catalogReservationSeats, catalogReservations } from "src/shared/db/schema";

export type CatalogReservationInsert = InferInsertModel<typeof catalogReservations>;
export type CatalogReservationRecord = InferSelectModel<typeof catalogReservations>;
export type CatalogReservationSeatInsert = InferInsertModel<typeof catalogReservationSeats>;
export type CatalogReservationSeatRecord = InferSelectModel<typeof catalogReservationSeats>;

export interface CatalogReservationsRepository {
  create(
    data: Omit<CatalogReservationInsert, "id" | "createdAt" | "updatedAt">,
    executor?: DbExecutor,
  ): Promise<CatalogReservationRecord>;
  findByIdAndTenantId(
    reservationId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogReservationRecord | null>;
  findManyByIdsAndTenantId(
    reservationIds: string[],
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogReservationRecord[]>;
  updateStatusByIdAndTenantId(
    reservationId: string,
    tenantId: string,
    status: CatalogReservationInsert["status"],
    executor?: DbExecutor,
  ): Promise<CatalogReservationRecord | null>;
}

export interface CatalogReservationSeatsRepository {
  createMany(
    data: Array<Omit<CatalogReservationSeatInsert, "id" | "createdAt">>,
    executor?: DbExecutor,
  ): Promise<CatalogReservationSeatRecord[]>;
  findManyByReservationIdAndTenantId(
    reservationId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogReservationSeatRecord[]>;
  findManyBySessionSeatIdsAndTenantId(
    sessionSeatIds: string[],
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogReservationSeatRecord[]>;
}
