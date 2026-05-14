import { DrizzleCatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/drizzle/catalog-session-seats.repository";

import { DrizzleCatalogReservationSeatsRepository } from "../repositories/drizzle/catalog-reservation-seats.repository";
import { DrizzleCatalogReservationsRepository } from "../repositories/drizzle/catalog-reservations.repository";
import { CancelReservationService } from "../services/cancel-reservation.service";

export function makeCancelReservationService() {
  return new CancelReservationService(
    new DrizzleCatalogReservationsRepository(),
    new DrizzleCatalogReservationSeatsRepository(),
    new DrizzleCatalogSessionSeatsRepository(),
  );
}
