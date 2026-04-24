import { ApiError } from "src/shared/errors/api-error";

import type { CatalogSessionsRepository } from "src/modules/sessions/repositories/contracts";

import type {
  UpdateSessionSeatStatusInput,
  UpdateSessionSeatStatusOutput,
} from "../dtos/update-session-seat-status.dto";
import type { CatalogSessionSeatsRepository } from "../repositories/contracts";

export class BlockSessionSeatService {
  constructor(
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
    private catalogSessionsRepo: CatalogSessionsRepository,
  ) {}

  async execute(input: UpdateSessionSeatStatusInput): Promise<UpdateSessionSeatStatusOutput> {
    const session = await this.catalogSessionsRepo.findByIdAndTenantId(
      input.sessionId,
      input.tenantId,
    );

    if (!session) {
      throw new ApiError("Session not found", 404);
    }

    const seat = await this.catalogSessionSeatsRepo.findByIdAndSessionIdAndTenantId(
      input.seatId,
      input.sessionId,
      input.tenantId,
    );

    if (!seat) {
      throw new ApiError("Session seat not found", 404);
    }

    if (seat.status !== "AVAILABLE") {
      throw new ApiError("Only AVAILABLE seats can be blocked", 409);
    }

    const updatedSeat = await this.catalogSessionSeatsRepo.updateStatusByIdAndSessionIdAndTenantId(
      input.seatId,
      input.sessionId,
      input.tenantId,
      "BLOCKED",
    );

    if (!updatedSeat) {
      throw new ApiError("Session seat not found", 404);
    }

    return updatedSeat;
  }
}
