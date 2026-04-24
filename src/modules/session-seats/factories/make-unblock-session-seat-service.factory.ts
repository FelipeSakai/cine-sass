import { DrizzleCatalogSessionsRepository } from "src/modules/sessions/repositories/drizzle/catalog-sessions.repository";

import { DrizzleCatalogSessionSeatsRepository } from "../repositories/drizzle/catalog-session-seats.repository";
import { UnblockSessionSeatService } from "../services/unblock-session-seat.service";

export function makeUnblockSessionSeatService() {
  return new UnblockSessionSeatService(
    new DrizzleCatalogSessionSeatsRepository(),
    new DrizzleCatalogSessionsRepository(),
  );
}
