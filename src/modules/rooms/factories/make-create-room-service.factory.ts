import { DrizzleCatalogRoomsRepository } from "../repositories/drizzle/catalog-rooms.repository";
import { CreateRoomService } from "../services/create-room.service";

export function makeCreateRoomService() {
  return new CreateRoomService(new DrizzleCatalogRoomsRepository());
}
