import { DrizzleCatalogRoomsRepository } from "../repositories/drizzle/catalog-rooms.repository";
import { GetRoomService } from "../services/get-room.service";

export function makeGetRoomService() {
  return new GetRoomService(new DrizzleCatalogRoomsRepository());
}
