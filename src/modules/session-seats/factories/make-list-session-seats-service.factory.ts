import { DrizzleCatalogSessionsRepository } from "src/modules/sessions/repositories/drizzle/catalog-sessions.repository";

import { DrizzleCatalogSessionSeatsRepository } from "../repositories/drizzle/catalog-session-seats.repository";
import { ListSessionSeatsService } from "../services/list-session-seats.service";

export function makeListSessionSeatsService() {
  return new ListSessionSeatsService(
    new DrizzleCatalogSessionSeatsRepository(),
    new DrizzleCatalogSessionsRepository(),
  );
}
