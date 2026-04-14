import { DrizzleCatalogRoomsRepository } from "../repositories/drizzle/catalog-rooms.repository";
import { ListRoomsService } from "../services/list-rooms.service";

export function makeListRoomsService() {
  return new ListRoomsService(new DrizzleCatalogRoomsRepository());
}
