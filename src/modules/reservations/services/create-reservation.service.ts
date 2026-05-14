import { db } from "src/shared/db/client";
import { ApiError } from "src/shared/errors/api-error";

import type { CatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/contracts";
import type { CatalogSessionsRepository } from "src/modules/sessions/repositories/contracts";

import type { CreateReservationInput, CreateReservationOutput } from "../dtos/create-reservation.dto";
import type { ExpireReservationHoldService } from "./expire-reservation-hold.service";
import type {
  CatalogReservationSeatsRepository,
  CatalogReservationsRepository,
} from "../repositories/contracts";

const HOLD_DURATION_MINUTES = 15;

export class CreateReservationService {
  constructor(
    private catalogReservationsRepo: CatalogReservationsRepository,
    private catalogReservationSeatsRepo: CatalogReservationSeatsRepository,
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
    private catalogSessionsRepo: CatalogSessionsRepository,
    private expireReservationHoldService: ExpireReservationHoldService,
  ) {}

  async execute(input: CreateReservationInput): Promise<CreateReservationOutput> {
    const uniqueSeatIds = [...new Set(input.seatIds)];

    if (uniqueSeatIds.length !== input.seatIds.length) {
      throw new ApiError("Seat ids must be unique", 400);
    }

    return db.transaction(async (tx) => {
      const session = await this.catalogSessionsRepo.findByIdAndTenantId(
        input.sessionId,
        input.tenantId,
        tx,
      );

      if (!session) {
        throw new ApiError("Session not found", 404);
      }

      const seats = await this.catalogSessionSeatsRepo.findManyByIdsAndSessionIdAndTenantId(
        uniqueSeatIds,
        input.sessionId,
        input.tenantId,
        tx,
      );

      if (seats.length !== uniqueSeatIds.length) {
        const sessionSeats = await this.catalogSessionSeatsRepo.findManyBySessionIdAndTenantId(
          input.sessionId,
          input.tenantId,
          tx,
        );

        if (sessionSeats.length === 0) {
          throw new ApiError("Session seat map not materialized", 404);
        }

        throw new ApiError("Session seat not found", 404);
      }

      const heldSeatIds = seats.filter((seat) => seat.status === "HELD").map((seat) => seat.id);

      if (heldSeatIds.length > 0) {
        const heldReservationSeats =
          await this.catalogReservationSeatsRepo.findManyBySessionSeatIdsAndTenantId(
            heldSeatIds,
            input.tenantId,
            tx,
          );

        const heldReservationIds = [...new Set(heldReservationSeats.map((seat) => seat.reservationId))];
        const heldReservations = await this.catalogReservationsRepo.findManyByIdsAndTenantId(
          heldReservationIds,
          input.tenantId,
          tx,
        );

        for (const reservation of heldReservations) {
          await this.expireReservationHoldService.execute(reservation, tx);
        }
      }

      const refreshedSeats = await this.catalogSessionSeatsRepo.findManyByIdsAndSessionIdAndTenantId(
        uniqueSeatIds,
        input.sessionId,
        input.tenantId,
        tx,
      );

      if (refreshedSeats.some((seat) => seat.status !== "AVAILABLE")) {
        throw new ApiError("Only AVAILABLE seats can be reserved", 409);
      }

      const heldSeats = await this.catalogSessionSeatsRepo.holdManyAvailableByIdsAndSessionIdAndTenantId(
        uniqueSeatIds,
        input.sessionId,
        input.tenantId,
        tx,
      );

      if (heldSeats.length !== uniqueSeatIds.length) {
        throw new ApiError("Only AVAILABLE seats can be reserved", 409);
      }

      const heldSeatIdsSet = new Set(heldSeats.map((seat) => seat.id));
      const orderedHeldSeats = refreshedSeats.filter((seat) => heldSeatIdsSet.has(seat.id));

      const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

      const reservation = await this.catalogReservationsRepo.create(
        {
          tenantId: input.tenantId,
          sessionId: input.sessionId,
          status: "HOLD",
          expiresAt,
          createdByUserId: input.actorUserId,
        },
        tx,
      );

      await this.catalogReservationSeatsRepo.createMany(
        orderedHeldSeats.map((seat) => ({
          tenantId: input.tenantId,
          reservationId: reservation.id,
          sessionSeatId: seat.id,
          seatKey: seat.seatKey,
        })),
        tx,
      );

      return {
        reservationId: reservation.id,
        sessionId: input.sessionId,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        seatCount: orderedHeldSeats.length,
        seats: orderedHeldSeats.map((seat) => ({
          id: seat.id,
          seatKey: seat.seatKey,
        })),
      };
    });
  }
}
