import { DrizzleCatalogMoviesRepository } from "src/modules/movies/repositories/drizzle/catalog-movies.repository";
import { DrizzleCatalogRoomsRepository } from "src/modules/rooms/repositories/drizzle/catalog-rooms.repository";
import { DrizzleCatalogSessionSeatsRepository } from "src/modules/session-seats/repositories/drizzle/catalog-session-seats.repository";
import { MaterializeSessionSeatsService } from "src/modules/session-seats/services/materialize-session-seats.service";

import { DrizzleCatalogSessionsRepository } from "../repositories/drizzle/catalog-sessions.repository";
import { CreateSessionService } from "../services/create-session.service";

export function makeCreateSessionService() {
  return new CreateSessionService(
    new DrizzleCatalogSessionsRepository(),
    new DrizzleCatalogMoviesRepository(),
    new DrizzleCatalogRoomsRepository(),
    new MaterializeSessionSeatsService(new DrizzleCatalogSessionSeatsRepository()),
  );
}
