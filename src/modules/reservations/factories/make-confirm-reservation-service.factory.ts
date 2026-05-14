import { DrizzleCatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/drizzle/catalog-session-seats.repository";

import { DrizzleCatalogReservationSeatsRepository } from "../repositories/drizzle/catalog-reservation-seats.repository";
import { DrizzleCatalogReservationsRepository } from "../repositories/drizzle/catalog-reservations.repository";
import { ExpireReservationHoldService } from "../services/expire-reservation-hold.service";
import { ConfirmReservationService } from "../services/confirm-reservation.service";

export function makeConfirmReservationService() {
  const catalogReservationsRepo = new DrizzleCatalogReservationsRepository();
  const catalogReservationSeatsRepo = new DrizzleCatalogReservationSeatsRepository();
  const catalogSessionSeatsRepo = new DrizzleCatalogSessionSeatsRepository();

  return new ConfirmReservationService(
    catalogReservationsRepo,
    catalogReservationSeatsRepo,
    catalogSessionSeatsRepo,
    new ExpireReservationHoldService(
      catalogReservationsRepo,
      catalogReservationSeatsRepo,
      catalogSessionSeatsRepo,
    ),
  );
}
