import { db } from "src/shared/db/client";
import { ApiError } from "src/shared/errors/api-error";

import type { GetReservationInput, GetReservationOutput } from "../dtos/get-reservation.dto";
import type { ExpireReservationHoldService } from "./expire-reservation-hold.service";
import type {
  CatalogReservationSeatsRepository,
  CatalogReservationsRepository,
} from "../repositories/contracts";

export class GetReservationService {
  constructor(
    private catalogReservationsRepo: CatalogReservationsRepository,
    private catalogReservationSeatsRepo: CatalogReservationSeatsRepository,
    private expireReservationHoldService: ExpireReservationHoldService,
  ) {}

  async execute(input: GetReservationInput): Promise<GetReservationOutput> {
    return db.transaction(async (tx) => {
      const reservation = await this.catalogReservationsRepo.findByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      if (!reservation) {
        throw new ApiError("Reservation not found", 404);
      }

      await this.expireReservationHoldService.execute(reservation, tx);

      const currentReservation = await this.catalogReservationsRepo.findByIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      if (!currentReservation) {
        throw new ApiError("Reservation not found", 404);
      }

      const reservationSeats = await this.catalogReservationSeatsRepo.findManyByReservationIdAndTenantId(
        input.reservationId,
        input.tenantId,
        tx,
      );

      return {
        reservationId: currentReservation.id,
        sessionId: currentReservation.sessionId,
        status: currentReservation.status,
        expiresAt: currentReservation.expiresAt,
        seatCount: reservationSeats.length,
        seats: reservationSeats.map((seat) => ({
          id: seat.sessionSeatId,
          seatKey: seat.seatKey,
        })),
      };
    });
  }
}
