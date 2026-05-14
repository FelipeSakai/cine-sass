import { DrizzleCatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/drizzle/catalog-session-seats.repository";
import { DrizzleCatalogSessionsRepository } from "src/modules/sessions/repositories/drizzle/catalog-sessions.repository";

import { DrizzleCatalogReservationSeatsRepository } from "../repositories/drizzle/catalog-reservation-seats.repository";
import { DrizzleCatalogReservationsRepository } from "../repositories/drizzle/catalog-reservations.repository";
import { ExpireReservationHoldService } from "../services/expire-reservation-hold.service";
import { CreateReservationService } from "../services/create-reservation.service";

export function makeCreateReservationService() {
  const catalogReservationsRepo = new DrizzleCatalogReservationsRepository();
  const catalogReservationSeatsRepo = new DrizzleCatalogReservationSeatsRepository();
  const catalogSessionSeatsRepo = new DrizzleCatalogSessionSeatsRepository();

  return new CreateReservationService(
    catalogReservationsRepo,
    catalogReservationSeatsRepo,
    catalogSessionSeatsRepo,
    new DrizzleCatalogSessionsRepository(),
    new ExpireReservationHoldService(
      catalogReservationsRepo,
      catalogReservationSeatsRepo,
      catalogSessionSeatsRepo,
    ),
  );
}
