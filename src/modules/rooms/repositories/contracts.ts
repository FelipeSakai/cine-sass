import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { catalogRooms } from "src/shared/db/schema";

export type CatalogRoomInsert = InferInsertModel<typeof catalogRooms>;
export type CatalogRoomRecord = InferSelectModel<typeof catalogRooms>;

export interface CatalogRoomsRepository {
  create(
    data: Omit<CatalogRoomInsert, "id" | "createdAt" | "updatedAt">,
    executor?: DbExecutor,
  ): Promise<CatalogRoomRecord>;
  findByIdAndTenantId(
    roomId: string,
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogRoomRecord | null>;
  findByNameAndTenantId(
    tenantId: string,
    name: string,
    executor?: DbExecutor,
  ): Promise<CatalogRoomRecord | null>;
  findManyByTenantId(
    tenantId: string,
    executor?: DbExecutor,
  ): Promise<CatalogRoomRecord[]>;
  updateByIdAndTenantId(
    roomId: string,
    tenantId: string,
    data: Partial<Pick<CatalogRoomInsert, "name" | "seatLayout" | "seatCount">>,
    executor?: DbExecutor,
  ): Promise<CatalogRoomRecord | null>;
}
