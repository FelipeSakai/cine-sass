import { ApiError } from "src/shared/errors/api-error";

import { countActiveSeats } from "../domain/room-seat-layout";
import type { UpdateRoomInput, UpdateRoomOutput } from "../dtos/update-room.dto";
import type { CatalogRoomsRepository } from "../repositories/contracts";

export class UpdateRoomService {
  constructor(private catalogRoomsRepo: CatalogRoomsRepository) {}

  async execute(input: UpdateRoomInput): Promise<UpdateRoomOutput> {
    const existing = await this.catalogRoomsRepo.findByIdAndTenantId(
      input.roomId,
      input.tenantId,
    );

    if (!existing) {
      throw new ApiError("Room not found", 404);
    }

    const nextName = input.name ?? existing.name;

    if (nextName !== existing.name) {
      const roomWithSameName = await this.catalogRoomsRepo.findByNameAndTenantId(
        input.tenantId,
        nextName,
      );

      if (roomWithSameName && roomWithSameName.id !== existing.id) {
        throw new ApiError("Room name already exists", 409);
      }
    }

    const nextSeatLayout = input.seatLayout ?? existing.seatLayout;
    const nextSeatCount = input.seatLayout
      ? countActiveSeats(input.seatLayout)
      : existing.seatCount;

    const updated = await this.catalogRoomsRepo.updateByIdAndTenantId(
      input.roomId,
      input.tenantId,
      {
        name: nextName,
        seatLayout: nextSeatLayout,
        seatCount: nextSeatCount,
      },
    );

    if (!updated) {
      throw new ApiError("Room not found", 404);
    }

    return updated;
  }
}
