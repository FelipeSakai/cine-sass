import { db } from "src/shared/db/client";
import { ApiError } from "src/shared/errors/api-error";

import type { CatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/contracts";

import type { CancelReservationInput, CancelReservationOutput } from "../dtos/cancel-reservation.dto";
import type {
  CatalogReservationSeatsRepository,
  CatalogReservationsRepository,
} from "../repositories/contracts";

export class CancelReservationService {
  constructor(
    private catalogReservationsRepo: CatalogReservationsRepository,
    private catalogReservationSeatsRepo: CatalogReservationSeatsRepository,
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
  ) {}

  async execute(input: CancelReservationInput): Promise<CancelReservationOutput> {
    return db.transaction(async (tx) => {
      const reservation = await this.catalogReservationsRepo.findByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      if (!reservation) {
        throw new ApiError("Reservation not found", 404);
      }

      if (reservation.status !== "HOLD") {
        throw new ApiError("Only HOLD reservations can be cancelled", 409);
      }

      const reservationSeats = await this.catalogReservationSeatsRepo.findManyByReservationIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      const seatIds = reservationSeats.map((seat) => seat.sessionSeatId);

      const updatedSeats = await this.catalogSessionSeatsRepo.updateManyByIdsAndSessionIdAndTenantId(
        seatIds,
        reservation.sessionId,
        input.tenantId,
        "HELD",
        "AVAILABLE",
        tx,
      );

      if (updatedSeats.length !== seatIds.length) {
        throw new ApiError("Reservation seats are no longer held", 409);
      }

      const updatedReservation = await this.catalogReservationsRepo.updateStatusByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        "CANCELLED",
        tx,
      );

      if (!updatedReservation) {
        throw new ApiError("Reservation not found", 404);
      }

      return {
        reservationId: updatedReservation.id,
        sessionId: updatedReservation.sessionId,
        status: updatedReservation.status,
        expiresAt: updatedReservation.expiresAt,
        seatCount: reservationSeats.length,
        seats: reservationSeats.map((seat) => ({
          id: seat.sessionSeatId,
          seatKey: seat.seatKey,
        })),
      };
    });
  }
}
