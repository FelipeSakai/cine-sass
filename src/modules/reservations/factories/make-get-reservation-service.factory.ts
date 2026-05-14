import { DrizzleCatalogReservationSeatsRepository } from "../repositories/drizzle/catalog-reservation-seats.repository";
import { DrizzleCatalogReservationsRepository } from "../repositories/drizzle/catalog-reservations.repository";
import { ExpireReservationHoldService } from "../services/expire-reservation-hold.service";
import { GetReservationService } from "../services/get-reservation.service";
import { DrizzleCatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/drizzle/catalog-session-seats.repository";

export function makeGetReservationService() {
  const catalogReservationsRepo = new DrizzleCatalogReservationsRepository();
  const catalogReservationSeatsRepo = new DrizzleCatalogReservationSeatsRepository();

  return new GetReservationService(
    catalogReservationsRepo,
    catalogReservationSeatsRepo,
    new ExpireReservationHoldService(
      catalogReservationsRepo,
      catalogReservationSeatsRepo,
      new DrizzleCatalogSessionSeatsRepository(),
    ),
  );
}
