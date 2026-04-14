import { ApiError } from "src/shared/errors/api-error";

import { countActiveSeats } from "../domain/room-seat-layout";
import type { CreateRoomInput, CreateRoomOutput } from "../dtos/create-room.dto";
import type { CatalogRoomsRepository } from "../repositories/contracts";

export class CreateRoomService {
  constructor(private catalogRoomsRepo: CatalogRoomsRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const existing = await this.catalogRoomsRepo.findByNameAndTenantId(
      input.tenantId,
      input.name,
    );

    if (existing) {
      throw new ApiError("Room name already exists", 409);
    }

    const seatCount = countActiveSeats(input.seatLayout);

    return this.catalogRoomsRepo.create({
      tenantId: input.tenantId,
      name: input.name,
      seatLayout: input.seatLayout,
      seatCount,
    });
  }
}
