import { ApiError } from "src/shared/errors/api-error";

import type { CatalogSessionsRepository } from "src/modules/sessions/repositories/contracts";

import type { ListSessionSeatsInput, ListSessionSeatsOutput } from "../dtos/list-session-seats.dto";
import type { CatalogSessionSeatsRepository } from "../repositories/contracts";

export class ListSessionSeatsService {
  constructor(
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
    private catalogSessionsRepo: CatalogSessionsRepository,
  ) {}

  async execute(input: ListSessionSeatsInput): Promise<ListSessionSeatsOutput> {
    const session = await this.catalogSessionsRepo.findByIdAndTenantId(
      input.sessionId,
      input.tenantId,
    );

    if (!session) {
      throw new ApiError("Session not found", 404);
    }

    const seats = await this.catalogSessionSeatsRepo.findManyBySessionIdAndTenantId(
      input.sessionId,
      input.tenantId,
    );

    if (seats.length === 0) {
      throw new ApiError("Session seat map not materialized", 404);
    }

    const summary = seats.reduce(
      (acc, seat) => {
        acc.total += 1;

        if (seat.status === "AVAILABLE") {
          acc.available += 1;
        }

        if (seat.status === "BLOCKED") {
          acc.blocked += 1;
        }

        if (seat.status === "RESERVED") {
          acc.reserved += 1;
        }

        return acc;
      },
      {
        total: 0,
        available: 0,
        blocked: 0,
        reserved: 0,
      },
    );

    return {
      sessionId: input.sessionId,
      summary,
      seats: seats.map((seat) => ({
        id: seat.id,
        seatKey: seat.seatKey,
        rowLabel: seat.rowLabel,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        status: seat.status,
        isAccessibilitySeat: seat.isAccessibilitySeat,
      })),
    };
  }
}
