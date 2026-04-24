import { DrizzleCatalogSessionsRepository } from "src/modules/sessions/repositories/drizzle/catalog-sessions.repository";

import { DrizzleCatalogSessionSeatsRepository } from "../repositories/drizzle/catalog-session-seats.repository";
import { BlockSessionSeatService } from "../services/block-session-seat.service";

export function makeBlockSessionSeatService() {
  return new BlockSessionSeatService(
    new DrizzleCatalogSessionSeatsRepository(),
    new DrizzleCatalogSessionsRepository(),
  );
}
