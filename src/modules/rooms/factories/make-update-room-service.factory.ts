import { DrizzleCatalogRoomsRepository } from "../repositories/drizzle/catalog-rooms.repository";
import { UpdateRoomService } from "../services/update-room.service";

export function makeUpdateRoomService() {
  return new UpdateRoomService(new DrizzleCatalogRoomsRepository());
}
