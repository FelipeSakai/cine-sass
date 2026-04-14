import { and, asc, eq } from "drizzle-orm";

import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import { db } from "src/shared/db/client";
import { catalogRooms } from "src/shared/db/schema";

import type {
  CatalogRoomInsert,
  CatalogRoomRecord,
  CatalogRoomsRepository,
} from "../contracts";

export class DrizzleCatalogRoomsRepository implements CatalogRoomsRepository {
  async create(
    data: Omit<CatalogRoomInsert, "id" | "createdAt" | "updatedAt">,
    executor: DbExecutor = db,
  ): Promise<CatalogRoomRecord> {
    const [created] = await executor.insert(catalogRooms).values(data).returning();

    return created;
  }

  async findByIdAndTenantId(
    roomId: string,
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogRoomRecord | null> {
    const [room] = await executor
      .select()
      .from(catalogRooms)
      .where(
        and(eq(catalogRooms.id, roomId), eq(catalogRooms.tenantId, tenantId)),
      )
      .limit(1);

    return room ?? null;
  }

  async findByNameAndTenantId(
    tenantId: string,
    name: string,
    executor: DbExecutor = db,
  ): Promise<CatalogRoomRecord | null> {
    const [room] = await executor
      .select()
      .from(catalogRooms)
      .where(
        and(eq(catalogRooms.tenantId, tenantId), eq(catalogRooms.name, name)),
      )
      .limit(1);

    return room ?? null;
  }

  async findManyByTenantId(
    tenantId: string,
    executor: DbExecutor = db,
  ): Promise<CatalogRoomRecord[]> {
    return executor
      .select()
      .from(catalogRooms)
      .where(eq(catalogRooms.tenantId, tenantId))
      .orderBy(asc(catalogRooms.name), asc(catalogRooms.createdAt));
  }

  async updateByIdAndTenantId(
    roomId: string,
    tenantId: string,
    data: Partial<Pick<CatalogRoomInsert, "name" | "seatLayout" | "seatCount">>,
    executor: DbExecutor = db,
  ): Promise<CatalogRoomRecord | null> {
    const [updated] = await executor
      .update(catalogRooms)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(catalogRooms.id, roomId), eq(catalogRooms.tenantId, tenantId)),
      )
      .returning();

    return updated ?? null;
  }
}
