import { ApiError } from "src/shared/errors/api-error";

import type { GetRoomInput, GetRoomOutput } from "../dtos/get-room.dto";
import type { CatalogRoomsRepository } from "../repositories/contracts";

export class GetRoomService {
  constructor(private catalogRoomsRepo: CatalogRoomsRepository) {}

  async execute(input: GetRoomInput): Promise<GetRoomOutput> {
    const room = await this.catalogRoomsRepo.findByIdAndTenantId(
      input.roomId,
      input.tenantId,
    );

    if (!room) {
      throw new ApiError("Room not found", 404);
    }

    return room;
  }
}
