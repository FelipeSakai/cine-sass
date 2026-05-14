import { db } from "src/shared/db/client";
import { ApiError } from "src/shared/errors/api-error";

import type { CatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/contracts";

import type { ConfirmReservationInput, ConfirmReservationOutput } from "../dtos/confirm-reservation.dto";
import type { ExpireReservationHoldService } from "./expire-reservation-hold.service";
import type {
  CatalogReservationSeatsRepository,
  CatalogReservationsRepository,
} from "../repositories/contracts";

export class ConfirmReservationService {
  constructor(
    private catalogReservationsRepo: CatalogReservationsRepository,
    private catalogReservationSeatsRepo: CatalogReservationSeatsRepository,
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
    private expireReservationHoldService: ExpireReservationHoldService,
  ) {}

  async execute(input: ConfirmReservationInput): Promise<ConfirmReservationOutput> {
    const result = await db.transaction(async (tx) => {
      const reservation = await this.catalogReservationsRepo.findByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      if (!reservation) {
        throw new ApiError("Reservation not found", 404);
      }

      const expired = await this.expireReservationHoldService.execute(reservation, tx);

      if (expired) {
        return { expired: true as const };
      }

      if (reservation.status !== "HOLD") {
        throw new ApiError("Only HOLD reservations can be confirmed", 409);
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
        "RESERVED",
        tx,
      );

      if (updatedSeats.length !== seatIds.length) {
        throw new ApiError("Reservation seats are no longer held", 409);
      }

      const updatedReservation = await this.catalogReservationsRepo.updateStatusByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        "CONFIRMED",
        tx,
      );

      if (!updatedReservation) {
        throw new ApiError("Reservation not found", 404);
      }

      return {
        expired: false as const,
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

    if (result.expired) {
      throw new ApiError("Reservation hold expired", 409);
    }

    return result;
  }
}
