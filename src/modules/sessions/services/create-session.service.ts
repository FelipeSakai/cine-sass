import { ApiError } from "src/shared/errors/api-error";
import { db } from "src/shared/db/client";

import type { CatalogMoviesRepository } from "src/modules/movies/repositories/contracts";
import type { CatalogRoomsRepository } from "src/modules/rooms/repositories/contracts";
import type { MaterializeSessionSeatsService } from "src/modules/session-seats/services/materialize-session-seats.service";

import type { CreateSessionInput, CreateSessionOutput } from "../dtos/create-session.dto";
import type { CatalogSessionsRepository } from "../repositories/contracts";

export class CreateSessionService {
  constructor(
    private catalogSessionsRepo: CatalogSessionsRepository,
    private catalogMoviesRepo: CatalogMoviesRepository,
    private catalogRoomsRepo: CatalogRoomsRepository,
    private materializeSessionSeatsService: MaterializeSessionSeatsService,
  ) {}

  async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
    if (input.endsAt <= input.startsAt) {
      throw new ApiError("Session end time must be after start time", 400);
    }

    return db.transaction(async (tx) => {
      const movie = await this.catalogMoviesRepo.findByIdAndTenantId(
        input.movieId,
        input.tenantId,
        tx,
      );

      if (!movie) {
        throw new ApiError("Movie not found", 404);
      }

      const room = await this.catalogRoomsRepo.findByIdAndTenantId(
        input.roomId,
        input.tenantId,
        tx,
      );

      if (!room) {
        throw new ApiError("Room not found", 404);
      }

      const overlappingSession = await this.catalogSessionsRepo.findOverlappingScheduledSession({
        tenantId: input.tenantId,
        roomId: input.roomId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        executor: tx,
      });

      if (overlappingSession) {
        throw new ApiError("Room already has a scheduled session in this time range", 409);
      }

      const session = await this.catalogSessionsRepo.create(
        {
          tenantId: input.tenantId,
          movieId: input.movieId,
          roomId: input.roomId,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          status: "SCHEDULED",
          roomLayoutSnapshot: room.seatLayout,
        },
        tx,
      );

      await this.materializeSessionSeatsService.execute(
        {
          tenantId: input.tenantId,
          sessionId: session.id,
          roomLayoutSnapshot: session.roomLayoutSnapshot,
        },
        tx,
      );

      return session;
    });
  }
}
