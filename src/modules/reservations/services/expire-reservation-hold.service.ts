import type { DbExecutor } from "src/modules/iam/repositories/contracts";
import type { CatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/contracts";

import type {
  CatalogReservationRecord,
  CatalogReservationSeatsRepository,
  CatalogReservationsRepository,
} from "../repositories/contracts";

export class ExpireReservationHoldService {
  constructor(
    private catalogReservationsRepo: CatalogReservationsRepository,
    private catalogReservationSeatsRepo: CatalogReservationSeatsRepository,
    private catalogSessionSeatsRepo: CatalogSessionSeatsRepository,
  ) {}

  async execute(
    reservation: CatalogReservationRecord,
    executor: DbExecutor,
    now = new Date(),
  ): Promise<boolean> {
    if (reservation.status !== "HOLD" || reservation.expiresAt > now) {
      return false;
    }

    const reservationSeats = await this.catalogReservationSeatsRepo.findManyByReservationIdAndTenantId(
      reservation.id,
      reservation.tenantId,
      executor,
    );

    const seatIds = reservationSeats.map((seat) => seat.sessionSeatId);

    await this.catalogSessionSeatsRepo.updateManyByIdsAndSessionIdAndTenantId(
      seatIds,
      reservation.sessionId,
      reservation.tenantId,
      "HELD",
      "AVAILABLE",
      executor,
    );

    await this.catalogReservationsRepo.updateStatusByIdAndTenantId(
      reservation.id,
      reservation.tenantId,
      "EXPIRED",
      executor,
    );

    return true;
  }
}
